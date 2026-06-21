const { Survey } = require('../model/survey');
const User = require('../model/user');

const getVisualizations = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { graphType, questionId, crossQuestionId } = req.query;

    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ status: 'failure', msg: 'Survey not found' });

    // Validate graphType
    const validGraphTypes = [
      'bar', 'pie', 'histogram', 'line',
      'stacked_bar', 'clustered_bar', 'area', 'box_plot', 'scatter', 'heatmap',
      'treemap', 'dendrogram', 'map', 'network', 'inferential_stats'
    ];

    if (!validGraphTypes.includes(graphType)) {
      return res.status(400).json({ status: 'failure', msg: 'Invalid graph type' });
    }

    let question = null;
    if (questionId) {
      question = survey.questions.id(questionId);
      if (!question) {
        return res.status(400).json({ status: 'failure', msg: 'Primary question ID not found' });
      }
    }

    // Require questionId for most graphs except 'map' or 'network'
    if (!question && !['map', 'network'].includes(graphType)) {
      return res.status(400).json({ status: 'failure', msg: 'Primary question ID is required for this graph type' });
    }

    let data = {};

    switch (graphType) {
      // ─── BASIC LEVEL & TREEMAP ───────────────────────────────────────────────
      case 'bar':
      case 'pie':
      case 'treemap':
      case 'histogram':
      case 'line':
      case 'area':
        let distributionObj = {};

        // 1. Try to calculate from raw answers (most accurate/reliable)
        if (question.answers && question.answers.length > 0) {
          question.answers.forEach(ans => {
            const response = String(ans.response);
            if (!distributionObj[response]) distributionObj[response] = 0;
            distributionObj[response]++;
          });
        }
        // 2. Fallback to pre-calculated analytics distribution 
        else if (question.analytics && question.analytics.distribution) {
          distributionObj = question.analytics.distribution instanceof Map
            ? Object.fromEntries(question.analytics.distribution)
            : question.analytics.distribution;
        }

        let labels = Object.keys(distributionObj);
        const values = Object.values(distributionObj);

        // Enhance labels for five_point questions
        if (question.questionType === 'five_point') {
          const fivePointMap = {
            '1': 'Strongly Disagree',
            '2': 'Disagree',
            '3': 'Neutral',
            '4': 'Agree',
            '5': 'Strongly Agree'
          };
          labels = labels.map(label => fivePointMap[label] || label);
        }

        data = { labels, values };

        // Specific formatting if needed by frontend
        if (graphType === 'treemap') {
          data.tree = labels.map((label, idx) => ({ name: label, value: values[idx] }));
        }
        break;

      // ─── INTERMEDIATE LEVEL ──────────────────────────────────────────────────
      case 'stacked_bar':
      case 'clustered_bar':
      case 'heatmap':
        // Needs a cross-tabulation of two questions to show composition/groups
        if (!crossQuestionId) {
          return res.status(400).json({ status: 'failure', msg: 'crossQuestionId query param is required for this graph type' });
        }

        const crossQ = survey.questions.id(crossQuestionId);
        if (!crossQ) return res.status(400).json({ status: 'failure', msg: 'crossQuestionId not found' });

        // Build a 2D cross-tabulation matrix
        const matrix = {};
        question.answers.forEach(ans => {
          const crossAns = crossQ.answers.find(a => a.userId.toString() === ans.userId.toString());
          if (crossAns) {
            const key1 = String(ans.response);
            const key2 = String(crossAns.response);
            if (!matrix[key1]) matrix[key1] = {};
            if (!matrix[key1][key2]) matrix[key1][key2] = 0;
            matrix[key1][key2]++;
          }
        });

        // Format for frontend
        const primaryLabels = Object.keys(matrix);
        const secondaryLabelsSet = new Set();
        primaryLabels.forEach(k => Object.keys(matrix[k]).forEach(sk => secondaryLabelsSet.add(sk)));
        const secondaryLabels = Array.from(secondaryLabelsSet);

        const datasets = secondaryLabels.map(secLabel => {
          return {
            label: secLabel,
            data: primaryLabels.map(primLabel => (matrix[primLabel] && matrix[primLabel][secLabel]) || 0)
          };
        });

        data = {
          labels: primaryLabels,
          datasets,
          matrix // raw matrix just in case
        };
        break;

      case 'box_plot':
        // 5-number summary (min, q1, median, q3, max)
        const numericResponses = question.answers
          .map(a => parseFloat(a.response))
          .filter(val => !isNaN(val))
          .sort((a, b) => a - b);

        if (numericResponses.length === 0) {
          data = { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
        } else {
          const min = numericResponses[0];
          const max = numericResponses[numericResponses.length - 1];

          const getMedian = (arr) => {
            if (arr.length === 0) return 0;
            const mid = Math.floor(arr.length / 2);
            return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
          };

          const med = getMedian(numericResponses);
          const lowerHalf = numericResponses.slice(0, Math.floor(numericResponses.length / 2));
          const upperHalf = numericResponses.slice(Math.ceil(numericResponses.length / 2));
          const q1 = getMedian(lowerHalf) || min;
          const q3 = getMedian(upperHalf) || max;

          // Simple outlier detection (1.5 * IQR)
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;

          const outliers = numericResponses.filter(x => x < lowerBound || x > upperBound);

          data = { min, q1, median: med, q3, max, outliers, raw: numericResponses };
        }
        break;

      case 'scatter':
        if (!crossQuestionId) {
          return res.status(400).json({ status: 'failure', msg: 'crossQuestionId required for scatter plot' });
        }
        const scatterCrossQ = survey.questions.id(crossQuestionId);

        const points = [];
        question.answers.forEach(ans => {
          const crossAns = scatterCrossQ.answers.find(a => a.userId.toString() === ans.userId.toString());
          if (crossAns) {
            const xVal = parseFloat(ans.response);
            const yVal = parseFloat(crossAns.response);
            if (!isNaN(xVal) && !isNaN(yVal)) {
              points.push({ x: xVal, y: yVal, userId: ans.userId });
            }
          }
        });
        data = { points };
        break;

      // ─── ADVANCED LEVEL ──────────────────────────────────────────────────────
      case 'dendrogram':
        // Used in hierarchical clustering analysis. 
        // Fetching real calculations from our Python Analytics Microservice
        try {
          const axios = require('axios');
          const pythonUrl = process.env.PYTHON_ANALYTICS_URL || 'http://127.0.0.1:8001';
          console.log("pythonUrl", pythonUrl)
          // We'll pass all questions to allow clustering based on the entire survey response profile
          const payload = {
            questions: survey.questions.map(q => ({
              questionId: q._id.toString(),
              text: q.questionText,
              answers: q.answers.map(a => ({
                userId: a.userId.toString(),
                response: a.response
              }))
            }))
          };

          const pythonResponse = await axios.post(`${pythonUrl}/api/cluster/dendrogram`, payload);
          data = pythonResponse.data;
        } catch (err) {
          console.error("Error communicating with Python microservice:", err.message);
          return res.status(500).json({ status: 'error', msg: 'Analytics service unavailable. Ensure Python microservice is running on port 8001.' });
        }
        break;

      case 'inferential_stats':
        // Auto-detects and runs inferential stats via Python microservice
        if (!crossQuestionId) {
          return res.status(400).json({ status: 'failure', msg: 'crossQuestionId required for inferential stats' });
        }
        const statsCrossQ = survey.questions.id(crossQuestionId);

        try {
          const axios = require('axios');
          const pythonUrl = process.env.PYTHON_ANALYTICS_URL || 'http://127.0.0.1:8001';

          const payload = {
            questions: [
              {
                questionId: question._id.toString(),
                text: question.questionText,
                answers: question.answers.map(a => ({
                  userId: a.userId.toString(),
                  response: a.response
                }))
              },
              {
                questionId: statsCrossQ._id.toString(),
                text: statsCrossQ.questionText,
                answers: statsCrossQ.answers.map(a => ({
                  userId: a.userId.toString(),
                  response: a.response
                }))
              }
            ]
          };

          // If there's more than 2 questions, we could pass all of them for Cronbach's alpha
          // But for now, we just pass the primary and cross questions for bivariate tests.

          const pythonResponse = await axios.post(`${pythonUrl}/api/stats/auto`, payload);
          data = pythonResponse.data.data; // extracts the 'data' object from python's response
        } catch (err) {
          console.error("Error communicating with Python microservice for stats:", err.message);
          return res.status(500).json({ status: 'error', msg: 'Analytics service unavailable or failed to process stats.' });
        }
        break;

      case 'network':
        // Shows relationships and connections between variables/entities.
        // Build nodes for questions and their popular answers, and links between them
        const nodes = [];
        const links = [];

        survey.questions.forEach(q => {
          nodes.push({ id: q._id.toString(), label: q.questionText, group: 'question' });

          // Calculate most common response on the fly if missing
          let mostCommon = q.analytics.mostCommonResponse;
          if (!mostCommon && q.analytics.distribution) {
            let maxCount = -1;
            q.analytics.distribution.forEach((count, key) => {
              if (count > maxCount) { maxCount = count; mostCommon = key; }
            });
          }

          // Link to top response
          if (mostCommon) {
            const ansId = `${q._id}_ans_${mostCommon}`;
            // Only push answer node if not already there
            if (!nodes.find(n => n.id === ansId)) {
              nodes.push({ id: ansId, label: String(mostCommon), group: 'answer' });
            }
            links.push({ source: q._id.toString(), target: ansId, value: q.analytics.totalResponses || 1 });
          }
        });

        data = { nodes, links };
        break;

      case 'map':
        // Map visualization based on faculty/department or other locational proxies
        if (survey.faculty_participants) {
          const mapData = survey.faculty_participants instanceof Map
            ? Object.fromEntries(survey.faculty_participants)
            : survey.faculty_participants;

          data = {
            locations: Object.keys(mapData).map(faculty => ({
              name: faculty,
              value: mapData[faculty]
            }))
          };
        } else {
          data = { locations: [] };
        }
        break;

      default:
        return res.status(400).json({ status: 'failure', msg: 'Unsupported graph type' });
    }

    res.status(200).json({
      status: 'success',
      graphType,
      data
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVisualizations
};
