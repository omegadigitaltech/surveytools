const fs = require('fs').promises;
const { Survey } = require('../model/survey');
const Section = require('../model/section');
const User = require('../model/user');
const { extractTextFromDocument } = require('../utils/documentProcessor');
const { processQuestionnaire } = require('../utils/geminiService');
const mongoose = require('mongoose');

/**
 * Controller for handling questionnaire document uploads and adding extracted questions to an existing survey
 */
const uploadQuestionnaire = async (req, res, next) => {
  const session = await mongoose.startSession();
  
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
    // if (survey.published) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(400).json({
    //     status: "failure",
    //     code: 400,
    //     msg: "Cannot add questions to a published survey"
    //   });
    // }

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

      let addedQuestions = 0;
      let updatedSurvey;
      await session.withTransaction(async () => {
        let sectionIdMap = {};
        if (extractedData && Array.isArray(extractedData.sections) && extractedData.sections.length > 0) {
          for (const [index, section] of extractedData.sections.entries()) {
            if (!section || !section.title) {
              continue;
            }
            const created = await Section.create([
              {
                surveyId: survey._id,
                title: section.title,
                description: section.description || '',
                order: typeof section.order === 'number' ? section.order : index + 1
              }
            ], { session });
            const tempId = section.id || `sec_${index + 1}`;
            sectionIdMap[tempId] = created[0]._id;
          }
        }

        const surveyTxn = await Survey.findById(surveyId).session(session);
        if (extractedData && extractedData.questions && Array.isArray(extractedData.questions)) {
          for (const question of extractedData.questions) {
            if (!question.questionText || !question.questionType) {
              continue;
            }
            const questionData = {
              questionText: question.questionText,
              questionType: question.questionType,
              required: question.required || false,
              sectionId: (question.sectionId && sectionIdMap[question.sectionId]) ? sectionIdMap[question.sectionId] : null
            };
            if ((question.questionType === 'multiple_choice' || question.questionType === 'multiple_selection') && Array.isArray(question.options)) {
              questionData.options = question.options.map(opt => {
                if (typeof opt === 'string') {
                  return { text: opt, allowsCustomInput: false };
                } else if (typeof opt === 'object' && opt.text) {
                  return { text: opt.text, allowsCustomInput: opt.allowsCustomInput || false };
                } else {
                  throw new Error('Invalid option format');
                }
              });
            }
            surveyTxn.questions.push(questionData);
            addedQuestions++;
          }
        } else {
          throw new Error('No valid questions could be extracted from the document');
        }
        surveyTxn.updatedAt = new Date();
        await surveyTxn.save({ session });
        updatedSurvey = surveyTxn;
      });

      session.endSession();
      res.status(200).json({
        status: "success",
        code: 200,
        msg: `${addedQuestions} questions successfully added to survey from uploaded document`,
        // survey: {
        //   _id: updatedSurvey._id,
        //   title: updatedSurvey.title,
        //   questionsCount: updatedSurvey.questions.length,
        //   questions: updatedSurvey.questions
        // }
      });
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      return;
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