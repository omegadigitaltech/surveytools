const fs = require('fs').promises;
const { Survey } = require('../model/survey');
const User = require('../model/user');
const { extractTextFromDocument } = require('../utils/documentProcessor');
const { processQuestionnaire } = require('../utils/geminiService');
const mongoose = require('mongoose');

/**
 * Controller for handling questionnaire document uploads and adding extracted questions to an existing survey
 */
const uploadQuestionnaire = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "No document uploaded"
      });
    }

    // Get the survey ID from request parameters
    const { surveyId } = req.params;
    if (!surveyId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Survey ID is required"
      });
    }

    // Get user
    const user = await User.findOne({id: req.userId}).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User Not Found"
      });
    }
    
    // Find the existing survey
    const survey = await Survey.findById(surveyId).session(session);
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "Survey not found"
      });
    }

    // Verify the user owns this survey
    if (!survey.user_id.equals(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        status: "failure",
        code: 403,
        msg: "Not authorized to add questions to this survey"
      });
    }
    
    // Cannot add questions to a published survey
    if (survey.published) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Cannot add questions to a published survey"
      });
    }

    // Process document
    console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);
    const filePath = req.file.path;
    
    try {
      // Extract document text and metadata
      const documentData = await extractTextFromDocument(filePath);
      console.log(`Extracted ${documentData.text.length} characters of text from document`);
      
      // Use Gemini to extract questionnaire data
      console.log('Sending document to Gemini for processing...');
      const extractedData = await processQuestionnaire(documentData);
      console.log(`Received response from Gemini: ${JSON.stringify(extractedData).substring(0, 300)}...`);
      
      // Track how many questions were added
      let addedQuestions = 0;
      
      // Add questions to the survey
      if (extractedData && extractedData.questions && Array.isArray(extractedData.questions)) {
        console.log(`Found ${extractedData.questions.length} questions to add`);
        
        for (const question of extractedData.questions) {
          // Skip questions that don't have required fields
          if (!question.questionText || !question.questionType) {
            console.log('Skipping question due to missing required fields');
            continue;
          }
          
          // Log question data for debugging
          console.log(`Processing question: ${question.questionText.substring(0, 50)}...`);
          
          const questionData = {
            questionText: question.questionText,
            questionType: question.questionType,
            required: question.required || false
          };
          
          // Add options for multiple-choice questions
          if (question.questionType === 'multiple_choice' && Array.isArray(question.options)) {
            questionData.options = question.options.map(opt => ({ text: opt }));
            console.log(`Added ${question.options.length} options to multiple choice question`);
          }
          
          survey.questions.push(questionData);
          addedQuestions++;
        }
        
        console.log(`Successfully added ${addedQuestions} questions to the survey`);
      } else {
        console.log('No valid questions found in AI response');
        throw new Error('No valid questions could be extracted from the document');
      }
      
      // Update the survey's last updated timestamp
      survey.updatedAt = new Date();
      await survey.save({ session });
      console.log(`Saved survey with ID: ${survey._id}`);
      
      // Clean up the uploaded file
      await fs.unlink(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
      
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({
        status: "success",
        code: 200,
        msg: `${addedQuestions} questions successfully added to survey from uploaded document`,
        survey: {
          _id: survey._id,
          title: survey.title,
          questionsCount: survey.questions.length,
          questions: survey.questions
        }
      });
    } catch (processingError) {
      // Handle document processing errors within the transaction
      console.error('Document processing error:', processingError);
      await session.abortTransaction();
      session.endSession();
      
      // Clean up the uploaded file
      try {
        await fs.unlink(filePath);
        console.log(`Deleted temporary file after error: ${filePath}`);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      
      // Return a more specific error message
      if (processingError.message.includes('No valid questions')) {
        return res.status(400).json({
          status: "failure",
          code: 400,
          msg: "Could not identify any valid questions in the document. Please check your document format."
        });
      } else if (processingError.message.includes('Failed to extract valid JSON')) {
        return res.status(500).json({
          status: "failure",
          code: 500,
          msg: "The AI could not properly analyze your document. Please try again or use a clearer document format."
        });
      } else {
        // Pass to the general error handler
        next(processingError);
      }
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Delete uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    console.error('Error processing questionnaire upload:', error);
    next(error);
  }
};

module.exports = {
  uploadQuestionnaire
}; 