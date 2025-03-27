const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if Gemini API key is configured
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
}

// Initialize the Generative AI API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Processes questionnaire text using Gemini API to extract structured questions
 * @param {Object} documentData - Object containing document text and file information
 * @param {string} surveyTitle - Optional title for the survey
 * @returns {Promise<Object>} - Structured question data
 */
async function processQuestionnaire(documentData, surveyTitle = '') {
  try {
    // Use Gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a detailed prompt for the AI
    const textPrompt = `
You are a research assistant tasked with converting a questionnaire document into structured JSON format.

Analyze the following document and extract all questions, organizing them by type:
- For multiple choice questions, extract the question text, identify it as "multiple_choice", and list all available options.
- For scale/rating questions (1-5), identify them as "five_point".
- For open-ended questions, identify them as "fill_in".
- Determine if each question is required or optional based on context clues.

The JSON output should match this structure:
{
  "questions": [
    {
      "questionText": "The full text of the question",
      "questionType": "multiple_choice | five_point | fill_in",
      "required": true | false,
      "options": ["Option 1", "Option 2", "Option 3"] // Only for multiple_choice questions
    }
  ]
}

Extract only the questions from the document, and format them according to the structure above.
`;

    let result;
    // Check if the file is in a format that Gemini can process directly
    if (documentData.fileType === 'pdf' || documentData.fileType === 'txt') {
      // For supported file types, send both the file and text
      const fileData = documentData.base64File;
      
      const parts = [
        { text: textPrompt },
        { fileData: { mimeType: `application/${documentData.fileType}`, data: fileData.split('base64,')[1] } },
        { text: "Please extract only the questions from this document and format them according to the structure specified above." }
      ];
      
      result = await model.generateContent({ contents: [{ role: "user", parts }] });
    } else {
      // For other file types, just send the extracted text
      const prompt = `${textPrompt}

Here's the document text:
${documentData.text}`;
      
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Failed to extract valid JSON from AI response');
    }
    
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error processing questionnaire with Gemini:', error);
    throw error;
  }
}

module.exports = {
  processQuestionnaire
}; 