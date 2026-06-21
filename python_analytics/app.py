from asyncio import protocols
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Any
import numpy as np
from scipy.cluster.hierarchy import linkage, to_tree
from scipy import stats
import pandas as pd
import logging
import time

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Survey Analytics API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response status: {response.status_code} (took {process_time:.4f}s)")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request failed after {process_time:.4f}s: {e}", exc_info=True)
        raise

class Answer(BaseModel):
    userId: str
    response: Any

class QuestionData(BaseModel):
    questionId: str
    text: str
    answers: List[Answer]

class DendrogramRequest(BaseModel):
    questions: List[QuestionData]

class StatsRequest(BaseModel):
    questions: List[QuestionData]

def is_numeric_array(arr):
    valid = 0
    for x in arr:
        try:
            float(x)
            valid += 1
        except:
            pass
    if len(arr) == 0: return False
    return (valid / len(arr)) > 0.8

def clean_numeric(arr):
    out = []
    for x in arr:
        try:
            out.append(float(x))
        except:
            out.append(np.nan)
    return out

def get_node_dict(node, labels):
    if node.is_leaf():
        return {
            "name": str(labels[node.id]),
            "value": 1
        }
    else:
        return {
            "name": f"Cluster {node.id}",
            "children": [
                get_node_dict(node.left, labels),
                get_node_dict(node.right, labels)
            ]
        }

@app.post("/api/cluster/dendrogram")
async def generate_dendrogram(request: DendrogramRequest):
    try:
        logger.info(f"Generating dendrogram for {len(request.questions) if request.questions else 0} questions")
        if not request.questions:
            raise HTTPException(status_code=400, detail="No questions provided")

        # Create a user-item matrix where rows are users and columns are question responses
        users_responses = {}
        
        # Keep track of which questions were categorical and might need encoding, 
        # but for simplicity, we assume answers are numeric or we can label encode them.
        for q in request.questions:
            for ans in q.answers:
                if ans.userId not in users_responses:
                    users_responses[ans.userId] = {}
                try:
                    # attempt to convert to float
                    val = float(ans.response)
                except (ValueError, TypeError):
                    # fallback to string length or simple hash as proxy if categorical 
                    # (in a real app, do proper one-hot or label encoding)
                    val = float(hash(str(ans.response)) % 100)
                
                users_responses[ans.userId][q.questionId] = val
                
        if not users_responses:
            raise HTTPException(status_code=400, detail="No valid responses found")
            
        df = pd.DataFrame.from_dict(users_responses, orient='index').fillna(0)
        
        if len(df) < 2:
            return {
                "name": "Survey Responses",
                "children": [{"name": str(idx), "value": 1} for idx in df.index]
            }
            
        # Perform hierarchical clustering on the users based on their responses
        Z = linkage(df, method='ward')
        root_node, node_list = to_tree(Z, rd=True)
        
        labels = list(df.index)
        tree_dict = get_node_dict(root_node, labels)
        
        # Add a root wrapper
        return {
            "name": "Survey Responses",
            "children": [tree_dict]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stats/auto")
async def generate_stats(request: StatsRequest):
    try:
        logger.info(f"Generating stats for {len(request.questions) if request.questions else 0} questions")
        if not request.questions or len(request.questions) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 questions for inferential stats")
            
        q1 = request.questions[0]
        q2 = request.questions[1]
        
        users = {}
        for ans in q1.answers:
            if ans.userId not in users: users[ans.userId] = {}
            users[ans.userId]['q1'] = ans.response
            
        for ans in q2.answers:
            if ans.userId not in users: users[ans.userId] = {}
            users[ans.userId]['q2'] = ans.response
            
        aligned_q1 = []
        aligned_q2 = []
        for uid, res in users.items():
            if 'q1' in res and 'q2' in res:
                aligned_q1.append(res['q1'])
                aligned_q2.append(res['q2'])
                
        if len(aligned_q1) < 3:
            return {"status": "error", "message": "Not enough overlapping responses"}

        q1_numeric = is_numeric_array(aligned_q1)
        q2_numeric = is_numeric_array(aligned_q2)
        
        q1_unique = len(set(aligned_q1))
        q2_unique = len(set(aligned_q2))
        
        q1_type = "continuous" if (q1_numeric and q1_unique > 5) else "categorical"
        q2_type = "continuous" if (q2_numeric and q2_unique > 5) else "categorical"
        
        # Cronbach's Alpha check if >= 3 questions
        if len(request.questions) >= 3:
            all_users = {}
            for i, q in enumerate(request.questions):
                for ans in q.answers:
                    if ans.userId not in all_users: all_users[ans.userId] = {}
                    all_users[ans.userId][f'q{i}'] = ans.response
            
            df_alpha = pd.DataFrame.from_dict(all_users, orient='index')
            # convert to numeric, drop missing
            df_alpha = df_alpha.apply(pd.to_numeric, errors='coerce').dropna()
            
            k = df_alpha.shape[1]
            if k >= 3 and len(df_alpha) > 2:
                item_vars = df_alpha.var(axis=0, ddof=1)
                total_var = df_alpha.sum(axis=1).var(ddof=1)
                if total_var > 0:
                    alpha = (k / (k - 1)) * (1 - item_vars.sum() / total_var)
                    return {
                        "status": "success", 
                        "data": {
                            "testName": "Cronbach's Alpha (Reliability)",
                            "apa": f"α = {alpha:.2f}, k = {k}, N = {len(df_alpha)}",
                            "interpretation": f"The internal consistency of these {k} items is {'excellent' if alpha > 0.9 else 'good' if alpha > 0.8 else 'acceptable' if alpha > 0.7 else 'poor'}."
                        }
                    }

        result = {}
        
        if q1_type == "categorical" and q2_type == "categorical":
            crosstab = pd.crosstab(pd.Series(aligned_q1), pd.Series(aligned_q2))
            chi2, p, dof, expected = stats.chi2_contingency(crosstab)
            n = sum(crosstab.sum())
            min_dim = min(crosstab.shape) - 1
            v = np.sqrt((chi2 / n) / min_dim) if min_dim > 0 else 0
            
            sig = "statistically significant" if p < 0.05 else "not statistically significant"
            
            # Format p value APA style
            p_str = "< .001" if p < 0.001 else f"= {p:.3f}".replace("0.", ".")
            
            result = {
                "testName": "Chi-Square Test of Independence",
                "apa": f"χ²({dof}, N={n}) = {chi2:.2f}, p {p_str}, V = {v:.2f}",
                "interpretation": f"There is a {sig} association between '{q1.text}' and '{q2.text}'."
            }
            
        elif (q1_type == "categorical" and q2_type == "continuous") or (q1_type == "continuous" and q2_type == "categorical"):
            cat_q = aligned_q1 if q1_type == "categorical" else aligned_q2
            cont_q = aligned_q2 if q1_type == "categorical" else aligned_q1
            cat_text = q1.text if q1_type == "categorical" else q2.text
            cont_text = q2.text if q1_type == "categorical" else q1.text
            
            continuous_data = np.array(clean_numeric(cont_q))
            groups = pd.Series(continuous_data).groupby(cat_q).apply(lambda x: [v for v in x if not np.isnan(v)]).to_dict()
            valid_groups = [g for g in groups.values() if len(g) > 1]
            
            if len(valid_groups) == 2:
                t_stat, p = stats.ttest_ind(valid_groups[0], valid_groups[1], nan_policy='omit')
                df = len(valid_groups[0]) + len(valid_groups[1]) - 2
                sig = "significant difference" if p < 0.05 else "no significant difference"
                p_str = "< .001" if p < 0.001 else f"= {p:.3f}".replace("0.", ".")
                result = {
                    "testName": "Independent Samples T-Test",
                    "apa": f"t({df}) = {t_stat:.2f}, p {p_str}",
                    "interpretation": f"There is {sig} in '{cont_text}' across the groups of '{cat_text}'."
                }
            elif len(valid_groups) > 2:
                f_stat, p = stats.f_oneway(*valid_groups)
                df1 = len(valid_groups) - 1
                df2 = sum(len(g) for g in valid_groups) - len(valid_groups)
                sig = "significant difference" if p < 0.05 else "no significant difference"
                p_str = "< .001" if p < 0.001 else f"= {p:.3f}".replace("0.", ".")
                result = {
                    "testName": "One-way ANOVA",
                    "apa": f"F({df1}, {df2}) = {f_stat:.2f}, p {p_str}",
                    "interpretation": f"There is {sig} in '{cont_text}' across the groups of '{cat_text}'."
                }
            else:
                return {"status": "error", "message": "Not enough valid groups for T-test/ANOVA."}
                
        elif q1_type == "continuous" and q2_type == "continuous":
            c1 = clean_numeric(aligned_q1)
            c2 = clean_numeric(aligned_q2)
            
            valid = [(x,y) for x,y in zip(c1,c2) if not np.isnan(x) and not np.isnan(y)]
            if len(valid) < 3:
                return {"status": "error", "message": "Not enough valid numeric pairs"}
                
            x = [v[0] for v in valid]
            y = [v[1] for v in valid]
            
            r, p = stats.pearsonr(x, y)
            sig = "significant" if p < 0.05 else "non-significant"
            direction = "positive" if r > 0 else "negative"
            p_str = "< .001" if p < 0.001 else f"= {p:.3f}".replace("0.", ".")
            result = {
                "testName": "Pearson Correlation",
                "apa": f"r({len(x)-2}) = {r:.2f}, p {p_str}",
                "interpretation": f"There is a {sig} {direction} correlation between '{q1.text}' and '{q2.text}'."
            }

        return {"status": "success", "data": result}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
