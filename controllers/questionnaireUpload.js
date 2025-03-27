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
    const filePath = req.file.path;
    const documentData = await extractTextFromDocument(filePath);
    
    // Use Gemini to extract questionnaire data
    const extractedData = await processQuestionnaire(documentData);
    
    // Track how many questions were added
    let addedQuestions = 0;
    
    // Add questions to the survey
    if (extractedData.questions && Array.isArray(extractedData.questions)) {
      for (const question of extractedData.questions) {
        // Skip questions that don't have required fields
        if (!question.questionText || !question.questionType) {
          continue;
        }
        
        const questionData = {
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required || false
        };
        
        // Add options for multiple-choice questions
        if (question.questionType === 'multiple_choice' && Array.isArray(question.options)) {
          questionData.options = question.options.map(opt => ({ text: opt }));
        }
        
        survey.questions.push(questionData);
        addedQuestions++;
      }
    }
    
    // Update the survey's last updated timestamp
    survey.updatedAt = new Date();
    await survey.save({ session });
    
    // Clean up the uploaded file
    await fs.unlink(filePath);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      status: "success",
      code: 200,
      msg: `${addedQuestions} questions successfully added to survey from uploaded document`,
      survey
    });
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