const { GoogleGenerativeAI, FileManager } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');

// Check if Gemini API key is configured
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
}

// Initialize the Generative AI API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/**
 * Upload a file to Gemini API
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} - Upload result
 */
async function uploadFile(buffer, mimeType) {
  try {        
    const tempDir = './temp_files';
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const displayName = `document_${timestamp}`;
    const filePath = path.join(tempDir, displayName);
    
    // Write buffer to file
    fs.writeFileSync(filePath, buffer, 'binary');
    
    // Upload file using FileManager
    const result = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: displayName,
    });

    // Clean up temporary file
    fs.unlinkSync(filePath);
  
    return result;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Processes questionnaire text using Gemini API to extract structured questions
 * @param {Object} documentData - Object containing document text and file information
 * @returns {Promise<Object>} - Structured question data
 */
async function processQuestionnaire(documentData) {
  try {
    // Use Gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a detailed prompt for the AI
    const textPrompt = `
You are a research assistant tasked with converting a questionnaire document into structured JSON with sections.

Analyze the document and extract:
1) A top-level list of sections with temporary IDs
2) All questions, organized by type, each linked to a section via its temporary ID

Question types:
- multiple_choice: select one option only
- multiple_selection: select multiple options
- five_point: scale/rating (1-5)
- fill_in: open-ended

For multiple_choice and multiple_selection options, set "allowsCustomInput" to true for options that:
- include words like "Other", "Specify", "Please specify", "Please explain", "If other"
- end with phrases like "(please specify)", "(specify)", "(explain)", "(other)"
- clearly capture additional information beyond standard options

Output JSON structure:
{
  "sections": [
    { "id": "sec-1", "title": "Section title", "description": "Optional description", "order": 1 },
    { "id": "sec-2", "title": "...", "description": "...", "order": 2 }
  ],
  "questions": [
    {
      "questionText": "Full question text",
      "questionType": "multiple_choice | multiple_selection | five_point | fill_in",
      "required": true | false,
      "sectionId": "sec-1",
      "options": [
        { "text": "Option text", "allowsCustomInput": true | false }
      ]
    }
  ]
}

Detect sections from headings, numbering, or formatting. If sections are not explicit, infer reasonable grouping and assign consistent temporary IDs (e.g., "sec-1", "sec-2").

Only return the JSON described above. Be thorough and intelligent in your analysis.
`;

    let result;
    
    // Get file buffer and determine MIME type
    const fileBuffer = Buffer.from(documentData.base64File.split('base64,')[1], 'base64');
    const mimeType = documentData.base64File.substring(
      documentData.base64File.indexOf(':') + 1, 
      documentData.base64File.indexOf(';')
    );
    
    // Upload file to Gemini API
    console.log(`Uploading file to Gemini API (${mimeType})...`);
    const uploadResult = await uploadFile(fileBuffer, mimeType);
    console.log(`File uploaded successfully: ${uploadResult.file.uri}`);
    
    // Use FileManager approach for all file types
    try {
      console.log('Generating content with uploaded file...');
      // Create content parts with file reference and prompt
      result = await model.generateContent([
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
        textPrompt,
      ]);
    } catch (fileProcessingError) {
      console.error('Error using file directly, falling back to text-only analysis:', fileProcessingError);
      
      // Fallback to text-only approach if file processing fails
      const prompt = `${textPrompt}

Here's the document text:
${documentData.text}`;
      
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();
    console.log(`Received response text length: ${text.length} characters`);

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonString = text;
    
    // If the response contains a code block, extract just the JSON part
    if (text.includes('```json')) {
      const jsonStartMarker = text.indexOf('```json');
      const contentStart = text.indexOf('\n', jsonStartMarker) + 1;
      const contentEnd = text.indexOf('```', contentStart);
      
      if (contentStart !== -1 && contentEnd !== -1) {
        jsonString = text.substring(contentStart, contentEnd).trim();
      }
    } else if (text.includes('```')) {
      const jsonStartMarker = text.indexOf('```');
      const contentStart = text.indexOf('\n', jsonStartMarker) + 1;
      const contentEnd = text.indexOf('```', contentStart);
      
      if (contentStart !== -1 && contentEnd !== -1) {
        jsonString = text.substring(contentStart, contentEnd).trim();
      }
    } else {
      // Try to find JSON object notation directly
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = text.substring(jsonStart, jsonEnd + 1);
      }
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Response text:', text);
      throw new Error('Failed to extract valid JSON from AI response');
    }
  } catch (error) {
    console.error('Error processing questionnaire with Gemini:', error);
    throw error;
  }
}

module.exports = {
  processQuestionnaire
};