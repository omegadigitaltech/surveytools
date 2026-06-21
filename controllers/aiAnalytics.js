const { Survey } = require('../model/survey');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateAiInsights = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { analysisType } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ status: 'error', msg: 'Gemini API key is not configured.' });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ status: 'failure', msg: 'Survey not found' });
    }

    // Prepare survey data for the AI
    // We will extract questions and aggregate their responses to minimize token usage while providing full context.
    const surveyData = survey.questions.map(q => {
      const responseCounts = {};
      if (q.answers && q.answers.length > 0) {
        q.answers.forEach(ans => {
          const resp = String(ans.response);
          responseCounts[resp] = (responseCounts[resp] || 0) + 1;
        });
      } else if (q.analytics && q.analytics.distribution) {
        const dist = q.analytics.distribution instanceof Map
          ? Object.fromEntries(q.analytics.distribution)
          : q.analytics.distribution;
        Object.assign(responseCounts, dist);
      }
      return {
        question: q.questionText,
        type: q.questionType,
        responses: responseCounts
      };
    });

    const surveyTitle = survey.title || 'Survey';
    const totalParticipants = survey.submittedUsers ? survey.submittedUsers.length : 0;

    // Define prompts for different analysis types
    let promptInstruction = '';
    switch (analysisType) {
      case 'Descriptive':
        promptInstruction = 'Provide a Descriptive Analysis. Summarize the data using means, percentages, frequencies, and highlight the most prominent trends. Answer the question: "What happened?"';
        break;
      case 'Diagnostic':
        promptInstruction = 'Provide a Diagnostic Analysis. Identify patterns, anomalies, and correlations in the responses to explain underlying causes. Answer the question: "Why did it happen?"';
        break;
      case 'Predictive':
        promptInstruction = 'Provide a Predictive Analysis. Based on these trends, forecast what is likely to happen in the future regarding the subjects of this survey. Answer the question: "What is likely to happen?"';
        break;
      case 'Prescriptive':
        promptInstruction = 'Provide a Prescriptive Analysis. Recommend actionable steps, optimized allocations, and decision rules based on these findings. Answer the question: "What should we do?"';
        break;
      case 'Customer':
        promptInstruction = 'Provide a Customer Analysis. Focus deeply on understanding customer/respondent behavior, demographics, preferences, and satisfaction levels.';
        break;
      case 'Market':
        promptInstruction = 'Provide a Market Analysis. Analyze these responses to infer market trends, competitive advantages, and potential industry shifts.';
        break;
      case 'Financial':
        promptInstruction = 'Provide a Financial Analysis. Evaluate any data related to revenue, costs, willingness to pay, or profitability indicators.';
        break;
      case 'Operational':
        promptInstruction = 'Provide an Operational Analysis. Focus on identifying bottlenecks, improving efficiency, and boosting productivity based on respondent feedback.';
        break;
      case 'Inferential':
        promptInstruction = 'Provide an Inferential Analysis. Draw statistical conclusions about the broader population from this sample. Discuss potential significance (e.g., simulated t-tests, chi-square logic).';
        break;
      case 'Correlation':
        promptInstruction = 'Provide a Correlation Analysis. Examine and detail the potential relationships and dependencies between different questions/variables.';
        break;
      default:
        promptInstruction = 'Provide a comprehensive general analysis of the survey results.';
    }

    const prompt = `
You are an expert Data Analyst and Business Intelligence professional.
Please analyze the following survey data for a survey titled "${surveyTitle}" which has ${totalParticipants} total participants.

Data Structure (Aggregated Responses per Question):
${JSON.stringify(surveyData, null, 2)}

Task:
${promptInstruction}

Format your response entirely in Markdown. Use clear headings, bullet points, and tables where appropriate to make the report visually appealing and easy to read. Do not include raw JSON in your response. Make the insights actionable and professional.
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Using pro for better reasoning

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({
      status: 'success',
      data: {
        analysisType,
        markdownReport: responseText
      }
    });

  } catch (err) {
    console.error("Error generating AI insights:", err);
    // Format error so frontend can read it gracefully
    return res.status(500).json({
      status: 'error',
      msg: 'Failed to generate AI insights. Please try again later.'
    });
  }
};

module.exports = {
  generateAiInsights
};
