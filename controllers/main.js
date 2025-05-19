const path = require('path')
const {Survey, Option, Question, Answer} = require('../model/survey')
const User = require('../model/user')
const Payment = require('../model/payment')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const mongoose = require('mongoose');
const {calculateSentiment} = require('../middleware/helper')
const { uploadQuestionnaire } = require('./questionnaireUpload');
const { createCsvString, formatSurveyDataForCsv } = require('../utils/exportService');
const { addEmailToQueue } = require('../utils/queueService');

const main_url = process.env.FRONTEND_URL

const start = async (req, res) => {
  const filePath = path.join(__dirname, '../index.html');
  res.sendFile(filePath);
}

const home = async (req, res) => {
  // make sure to verify 
  console.log(req.userId)

  // let user = req.user.displayName
  res.send(`Hello`)
}


const createSurvey = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {title, description, no_of_participants, gender, preferred_participants } = req.body;
    const user = await User.findOne({id: req.userId});
    
    if(!user){
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User Not Found"
      });
    }
  
    // check that user has instituition filled
    if(!user.instituition){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "To create a survey, fill in your instituition"
      });
    }
  
    // First create the survey
    const survey = await Survey.create([{
      user_id: user._id,
      title,
      description,
      preferred_participants,
      gender,
      no_of_participants
    }], { session });

    // Then populate the user data
    const populatedSurvey = await Survey.findById(survey[0]._id)
      .populate({
        path: 'user_id',
        select: 'fullname email instituition pic_url'
      })
      .session(session);

    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      status: "success",
      code: 201,
      msg: `Survey successfully created by ${user.fullname}`,
      survey: populatedSurvey
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};



// Not really needed. As could affect the response analytics if eventually not submitted. Best to save in frontend
const updateAnswer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(req.body)
  console.log(req.userId)
  try {
    const { questionId } = req.params;
    const { response } = req.body;
    const user = await User.findOne({ id: req.userId }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findOne({ 'questions._id': questionId }).session(session);
    console.log(survey)
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: 'Question not found' });
    }

    const question = survey.questions.find(q => q._id.toString() === questionId);
    if (!question) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: 'Question not found' });
    }

    if(survey.published == false){
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has not been published' });
    }

    if (survey.submittedUsers.includes(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'User has already submitted the survey' });
    }

    if (survey.participants >= survey.no_of_participants) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has reached maximum participants' });
    }

    // Validate response for five_point and multiple_choice questions
    console.log(response)
    if (response) {
      if (question.questionType === 'five_point') {
        if (isNaN(parseInt(response, 10)) || parseInt(response, 10)  < 1 || parseInt(response, 10) > 5) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ status: "failure", code: 400, msg: 'Response must be between 1 and 5 for five_point question' });
        }
      } else if (question.questionType === 'multiple_choice') {
        const validOptions = question.options.map(opt => opt.text);
        if (!validOptions.includes(response)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ status: "failure", code: 400, msg: 'Response must be one of the provided options for multiple_choice question' });
        }
      } else if (question.questionType === 'multiple_selection') {
        // For multiple_selection, response must be an array of strings
        if (!Array.isArray(response) || response.length === 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ status: "failure", code: 400, msg: 'Response must be an array of selected options for multiple_selection question' });
        }
        
        const validOptions = question.options.map(opt => opt.text);
        // Check if all selected options are valid
        const invalidOptions = response.filter(option => !validOptions.includes(option));
        if (invalidOptions.length > 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            status: "failure", 
            code: 400, 
            msg: `Response contains invalid options: ${invalidOptions.join(', ')}` 
          });
        }
      }
  
  
      const existingAnswer = question.answers.find(a => a.userId.equals(user._id));
      if (existingAnswer) {
        existingAnswer.response = response;
      } else {
        question.answers.push({ fullname: user.fullname, response, userId: user._id });
      }
    }

    await survey.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: "success", code: 200, msg: `Answer successfully updated by ${user.fullname}`, survey });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(req.body)
  console.log(req.userId)
  try {
    const { surveyId } = req.params;
    const { answers } = req.body;
    const user = await User.findOne({ id: req.userId }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findById(surveyId).session(session);
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    // Check gender requirements
    if (survey.gender !== 'all_genders' && user.gender !== survey.gender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        status: "failure", 
        code: 400, 
        msg: `This survey is only open to ${survey.gender} participants` 
      });
    }

    // Check preferred participants requirements
    if (Array.isArray(survey.preferred_participants) && survey.preferred_participants.length > 0) {
      const [faculty, department] = survey.preferred_participants;
      
      // Case 1: If faculty is not "all faculties", check faculty match
      if (faculty.toLowerCase() !== 'all faculties') {
        if (user.faculty.toLowerCase() !== faculty.toLowerCase()) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            status: "failure", 
            code: 400, 
            msg: `This survey is only open to participants from ${faculty} faculty` 
          });
        }
        
        // Case 2: If department is specified (not "all departments"), check department match
        if (department && department.toLowerCase() !== 'all departments') {
          if (user.department.toLowerCase() !== department.toLowerCase()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              status: "failure", 
              code: 400, 
              msg: `This survey is only open to participants from ${department} department` 
            });
          }
        }
      }
    }

    if (survey.published == false) {
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has not been published' });
    }

    if (survey.submittedUsers.includes(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'User has already submitted the survey' });
    }

    if (survey.participants >= survey.no_of_participants) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has reached maximum participants' });
    }

    // Validate answers structure
    console.log(answers)
    if (!Array.isArray(answers) || answers.some(answer => !answer.questionId || typeof answer.response === 'undefined')) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'Invalid answers structure' });
    }

    for (const question of survey.questions) {
      const answer = answers.find(a => a.questionId === question._id.toString());
      if (question.required && !answer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ status: "failure", code: 400, msg: `Required question ${question._id} is not answered` });
      }

      if (answer && answer.response) {
        // Validate response for five_point and multiple_choice questions
        if (question.questionType === 'five_point') {
          if (isNaN(parseInt(answer.response, 10)) || parseInt(answer.response, 10)  < 1 || parseInt(answer.response, 10) > 5) {
          
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: "failure", code: 400, msg: `Response for question ${question._id} must be between 1 and 5 for five_point question` });
          }
          // Update averageRating
          question.analytics.averageRating = (question.analytics.averageRating * question.analytics.totalResponses + parseInt(answer.response)) / (question.analytics.totalResponses + 1);
        } else if (question.questionType === 'multiple_choice') {
          const validOptions = question.options.map(opt => opt.text);
          if (!validOptions.includes(answer.response)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: "failure", code: 400, msg: `Response for question ${question._id} must be one of the provided options for multiple_choice question` });
          }
        } else if (question.questionType === 'multiple_selection') {
          // For multiple_selection, response must be an array of strings
          if (!Array.isArray(answer.response) || answer.response.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: "failure", code: 400, msg: `Response for question ${question._id} must be an array of selected options for multiple_selection question` });
          }
          
          const validOptions = question.options.map(opt => opt.text);
          // Check if all selected options are valid
          const invalidOptions = answer.response.filter(option => !validOptions.includes(option));
          if (invalidOptions.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              status: "failure", 
              code: 400, 
              msg: `Response for question ${question._id} contains invalid options: ${invalidOptions.join(', ')}` 
            });
          }
        }

        const existingAnswer = question.answers.find(a => a.userId.equals(user._id));
        if (existingAnswer) {
          existingAnswer.response = answer.response;
        } else {
          question.answers.push({ fullname: user.fullname, response: answer.response, userId: user._id });
        }

        question.analytics.totalResponses += 1;
        // Ensure `distribution` is initialized as a Map
        if (!question.analytics.distribution) {
          question.analytics.distribution = new Map();
        }

        if (question.questionType === 'multiple_choice' || question.questionType === 'five_point') {
          
          // Convert the response to a string before using it as a Map key
          const responseKey = String(answer.response);
          question.analytics.distribution.set(responseKey, (question.analytics.distribution.get(responseKey) || 0) + 1);
          
          if (question.questionType === 'five_point') {
            question.analytics.averageRating = (question.analytics.averageRating * (question.analytics.totalResponses - 1) + parseInt(answer.response)) / question.analytics.totalResponses;
          }
        } else if (question.questionType === 'multiple_selection') {
          // For multiple_selection, update distribution for each selected option
          answer.response.forEach(selectedOption => {
            const responseKey = String(selectedOption);
            question.analytics.distribution.set(responseKey, (question.analytics.distribution.get(responseKey) || 0) + 1);
          });
        }

        if (question.questionType === 'fill_in') {
          const fillInResponses = question.answers;
          const sentimentAnalysis = await calculateSentiment(fillInResponses);
          question.analytics.sentimentAnalysis = sentimentAnalysis;
        }

        if (question.analytics.distribution && question.analytics.distribution.size > 0) {
          const maxResponse = [...question.analytics.distribution.entries()].reduce((a, b) => b[1] > a[1] ? b : a, [null, 0]);
          question.analytics.mostCommonResponse = maxResponse[0];
        } else {
          question.analytics.mostCommonResponse = null; // Fallback if there are no responses yet
        }

        question.analytics.responseRate = `${((question.analytics.totalResponses / survey.no_of_participants) * 100).toFixed(2)}%`;
      }
    }

    survey.participants += 1;
    survey.submittedUsers.push(user._id);

    await survey.save({ session });

    // Add points to user's balance only if point_per_user is a valid number
    if (survey.point_per_user && !isNaN(survey.point_per_user)) {
      user.pointBalance += survey.point_per_user;
    } else {
      console.log(`Warning: Invalid point_per_user value (${survey.point_per_user}) for survey ${survey._id}`);
    }
    
    await user.save({ session })

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: "success", code: 200, msg: 'Survey successfully submitted', survey });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};




const checkUserFilledSurvey = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (survey.submittedUsers.includes(user._id)) {
      return res.status(200).json({ status: "success", code: 200, submitted: true });
    }

    res.status(200).json({ status: "success", code: 200, submitted: false });
  } catch (error) {
    next(error);
  }
};

const checkSurveyMaxParticipants = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (survey.participants >= survey.no_of_participants) {
      return res.status(200).json({ status: "success", code: 200, maxReached: true });
    }

    res.status(200).json({ status: "success", code: 200, maxReached: false });
  } catch (error) {
    next(error);
  }
};

// Add or update question
const addOrUpdateQuestion = async (req, res, next) => {
  console.log(req.body)
  console.log(req.userId)
  try {
    const { surveyId } = req.params;
    const { questionId, questionText, questionType, required, options } = req.body;
    console.log(req.body)

    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to add questions to this survey' });
    }

    // Ensure `questionText`, `questionType`, and other required fields are defined
    if (!questionText || !questionType) {
      return res.status(400).json({ status: "failure", code: 400, msg: 'Question text and type are required.' });
    }


    // Format `options` array if questionType is multiple_choice
    let formattedOptions = [];
    if ((questionType === 'multiple_choice' || questionType === 'multiple_selection') && Array.isArray(options)) {
      formattedOptions = options.map(option => ({
        text: option // Convert each option string to an object with `text` property
      }));
    }

  
    const question = survey.questions.find(q => q._id.toString() === questionId);
    if (question) {
      question.questionText = questionText;
      question.questionType = questionType;
      question.required = required !== undefined ? required : question.required; // Use existing value if undefined
      question.options = (questionType === 'multiple_choice' || questionType === 'multiple_selection') ? formattedOptions : [];
      survey.updatedAt = new Date();
    } else {
      survey.questions.push({
        questionText,
        questionType,
        required,
        options,
        required: required || false,
        options: (questionType === 'multiple_choice' || questionType === 'multiple_selection') ? formattedOptions : []

      });
      survey.updatedAt = new Date();
    }

    await survey.save();

    res.status(200).json({ status: "success", code: 200, msg: 'Question added/updated successfully', survey });
  } catch (error) {
    next(error);
  }
};

// Add or update multiple questions at once
const bulkAddOrUpdateQuestions = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { questions } = req.body;
    console.log(questions)
    
    // Validate input
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        status: "failure", 
        code: 400, 
        msg: 'Questions must be provided as a non-empty array' 
      });
    }
    
    // Get user
    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ 
        status: "failure", 
        code: 404, 
        msg: "User Not Found" 
      });
    }
    
    // Find the survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ 
        status: "failure", 
        code: 404, 
        msg: 'Survey not found' 
      });
    }
    
    // Check user authorization
    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ 
        status: "failure", 
        code: 403, 
        msg: 'User not authorized to modify this survey' 
      });
    }
    
    // Cannot add questions to a published survey
    if (survey.published) {
      return res.status(400).json({ 
        status: "failure", 
        code: 400, 
        msg: "Cannot add questions to a published survey" 
      });
    }
    
    // Process each question
    const results = {
      added: 0,
      updated: 0,
      failed: 0,
      details: []
    };
    
    let modifiedQuestionsCount = 0;
    
    for (const question of questions) {
      try {
        // Extract question data
        const { questionId, questionText, questionType, required, options } = question;
        console.log(options)
        
        // Validate required fields
        if (!questionText || !questionType) {
          results.failed++;
          results.details.push({
            question: questionText || 'Unknown question',
            status: 'failed',
            reason: 'Question text and type are required'
          });
          continue;
        }
        
        // Validate question type
        const validQuestionTypes = ['multiple_choice', 'five_point', 'fill_in', 'multiple_selection'];
        if (!validQuestionTypes.includes(questionType)) {
          results.failed++;
          results.details.push({
            question: questionText,
            status: 'failed',
            reason: `Invalid question type: ${questionType}. Must be one of: ${validQuestionTypes.join(', ')}`
          });
          continue;
        }
        
        // Validate options for multiple choice and multiple selection questions
        if ((questionType === 'multiple_choice' || questionType === 'multiple_selection') && 
            (!options || !Array.isArray(options) || options.length < 2)) {
          results.failed++;
          results.details.push({
            question: questionText,
            status: 'failed',
            reason: `${questionType} questions must have at least 2 options`
          });
          continue;
        }
        
        // Format options for multiple-choice and multiple-selection questions
        let formattedOptions = [];
        if ((questionType === 'multiple_choice' || questionType === 'multiple_selection') && Array.isArray(options)) {
          formattedOptions = options.map(option => ({
            text: option // Convert each option string to an object with `text` property
          }));
        }
        
        // Find existing question or create new one
        const existingQuestion = questionId ? survey.questions.find(q => q._id.toString() === questionId) : null;
        
        console.log(formattedOptions)
        if (existingQuestion) {
          // Update existing question
          existingQuestion.questionText = questionText;
          existingQuestion.questionType = questionType;
          existingQuestion.required = required !== undefined ? required : existingQuestion.required;
          existingQuestion.options = (questionType === 'multiple_choice' || questionType === 'multiple_selection') ? formattedOptions : [];
          
          results.updated++;
          results.details.push({
            questionId: existingQuestion._id.toString(),
            question: questionText,
            status: 'updated'
          });
          
          modifiedQuestionsCount++;
        } else {
          // Add new question
          const newQuestion = {
            questionText,
            questionType,
            required: required !== undefined ? required : false,
            options: (questionType === 'multiple_choice' || questionType === 'multiple_selection') ? formattedOptions : [],
            analytics: {
              totalResponses: 0,
              averageRating: 0,
              responseRate: '0%',
              distribution: new Map(),
              mostCommonResponse: null,
              sentimentAnalysis: null
            }
          };
          
          survey.questions.push(newQuestion);
          
          // Get the ID of the newly added question (last element in the array)
          const addedQuestionId = survey.questions[survey.questions.length - 1]._id.toString();
          
          results.added++;
          results.details.push({
            questionId: addedQuestionId,
            question: questionText,
            status: 'added'
          });
          
          modifiedQuestionsCount++;
        }
      } catch (questionError) {
        console.error('Error processing question:', questionError);
        results.failed++;
        results.details.push({
          question: question.questionText || 'Unknown question',
          status: 'failed',
          reason: questionError.message
        });
      }
    }
    
    // Only save if any questions were modified
    if (modifiedQuestionsCount > 0) {
      // Update survey timestamp
      survey.updatedAt = new Date();
      await survey.save();
    }
    
    res.status(200).json({ 
      status: "success", 
      code: 200, 
      msg: `Questions processed: ${results.added} added, ${results.updated} updated, ${results.failed} failed`,
      results,
      survey: {
        _id: survey._id,
        title: survey.title,
        questionsCount: survey.questions.length
      }
    });
  } catch (error) {
    console.error('Error in bulkAddOrUpdateQuestions:', error);
    next(error);
  }
};

// Edit survey information
const editSurveyInfo = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const {title, description, no_of_participants, point_per_user, duration, preferred_participants } = req.body

    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey_ = await Survey.findById(surveyId);
    if (!survey_) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to edit this survey' });
    }

    const survey = await Survey.findByIdAndUpdate(surveyId, 
      {title, description, no_of_participants, point_per_user, duration, preferred_participants 
      }, { new: true, runValidators: true});

    res.status(200).json({ status: "success", code: 200, msg: 'Survey updated successfully', survey });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const { surveyId, questionId } = req.params;
    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to delete questions from this survey' });
    }

    const questionIndex = survey.questions.findIndex(q => q._id.toString() === questionId);
    console.log(questionIndex)
    if (questionIndex === -1) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Question not found' });
    }

    survey.questions.splice(questionIndex, 1);
    survey.updatedAt = new Date();

    await survey.save();

    res.status(200).json({ status: "success", code: 200, survey, msg: "Question deleted succesfully" });
  } catch (error) {
    next(error);
  }
};

// get a single survey info
const getSurveyInfo = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { userId } = req;
    
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'User not found' });
    }

    const survey = await Survey.findById(surveyId)
      .populate('user_id', 'fullname email instituition pic_url')

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    const filledCount = survey.submittedUsers.length;
    const remainingSpots = survey.no_of_participants - filledCount;

    const surveyWithCounts = {
      ...survey.toObject(),
      participantCounts: {
        filled: filledCount,
        remaining: remainingSpots,
        total: survey.no_of_participants
      },
      isCreator: survey.user_id._id.equals(user._id)
    };

    res.status(200).json({ 
      status: "success", 
      code: 200, 
      survey: surveyWithCounts 
    });
  } catch (error) {
    next(error);
  }
};

// get all user answers on a particular survey including the questions
const getUserSurveyData = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: "User Not Found" });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    const userAnswers = survey.questions.map(question => ({
      questionId: question._id,
      questionText: question.questionText,
      questionType: question.questionType,
      required: question.required,
      userResponse: question.answers.find(answer => answer.userId.equals(user._id))?.response || null
    }));

    res.status(200).json({ status: "success", code: 200, surveyId: survey._id, userAnswers });
  } catch (error) {
    next(error);
  }
};


const publishSurvey = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);
    const user = await User.findOne({ id: req.userId });
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to publish this survey' });
    }

    const payment = await Payment.findOne({ surveyId }).sort({ createdAt: -1 });
    if(!payment){
      return res.status(400).json({ status: "failure", code: 400, msg: 'No payment found' });
    }

    // Calculate expected payment amount
    const BASE_RATE = 500;
    const QUESTION_RATE = 10;
    const PARTICIPANT_RATE = 40;

    const expectedAmount = BASE_RATE + 
      (QUESTION_RATE * survey.questions.length) + 
      (PARTICIPANT_RATE * survey.no_of_participants);

    // Verify payment amount matches expected amount
    if (payment.amount !== expectedAmount) {
      return res.status(400).json({ 
        status: "failure", 
        code: 400, 
        msg: 'Payment amount does not match expected amount.',
        expected: expectedAmount,
        received: payment.amount
      });
    }

    survey.published = true;
    survey.link = `https://${main_url}/expandsurvey/${surveyId}`;
    await survey.save();

    // Get the populated survey to include in the notification
    const populatedSurvey = await Survey.findById(surveyId).populate({
      path: 'user_id',
      select: 'fullname email instituition'
    });

    try {
      // Add email notification job to the queue
      // Create a properly structured survey object with user details
      const surveyForQueue = {
        ...populatedSurvey.toObject(),
        user_id: {
          _id: populatedSurvey.user_id._id,
          fullname: populatedSurvey.user_id.fullname,
          email: populatedSurvey.user_id.email,
          instituition: populatedSurvey.user_id.instituition
        }
      };
      
      console.log("User data for queue:", surveyForQueue.user_id);
      
      const result = await addEmailToQueue('survey-published', { 
        survey: surveyForQueue
      });
      
      if (result && result.status === 'error') {
        console.warn('Email notification queue not available, but survey was published successfully');
      } else {
        console.log('Email notification job added to queue');
      }
    } catch (queueError) {
      // Log the error but don't fail the publish operation
      console.error('Failed to queue email notifications:', queueError);
      console.warn('Survey published successfully, but email notifications may not be sent');
    }

    res.status(200).json({ status: "success", code: 200, msg: 'Survey published', link: survey.link });
  } catch (error) {
    next(error);
  }
};


const getAllSurveys = async (req, res, next) => {
  try {
    const surveys = await Survey.find({published: true})
      .populate({
        path: 'user_id',
        select: 'fullname email instituition pic_url'
      });
      
    const surveysWithCounts = surveys.map(survey => {
      const filledCount = survey.submittedUsers.length;
      const remainingSpots = survey.no_of_participants - filledCount;
      
      return {
        ...survey.toObject(),
        participantCounts: {
          filled: filledCount,
          remaining: remainingSpots,
          total: survey.no_of_participants
        }
      };
    });

    res.status(200).json({ 
      status: "success", 
      code: 200, 
      surveys: surveysWithCounts 
    });
  } catch (error) {
    next(error);
  }
};

// get all survey questions, answers and analytics only for published surveys
const getSurveyAnalytics = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId).select('questions');

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }
    if(survey.published == false){
      return res.status(401).json({ status: "failure", code: 401, msg: 'Unauthorized action, The survey is not published' });
    }

    const questionsAnalytics = survey.questions.map(question => ({
      questionId: question._id,
      questionText: question.questionText,
      questionType: question.questionType,
      required: question.required,
      options: question.options,
      answers: question.answers,
      analytics: question.analytics
    }));

    res.status(200).json({ status: "success", code: 200, questions: questionsAnalytics });
  } catch (error) {
    next(error);
  }
};

// get all questions that has been added to a particular survey
const getSurveyQuestions = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId).select('questions._id questions.questionText questions.questionType questions.required questions.options');

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    res.status(200).json({ status: "success", code: 200, questions: survey.questions });
  } catch (error) {
    next(error);
  }
};

// Modify for later use
const createOption = async (req, res) => {
    const option = await Option.create({
      
    })
}

const createAnswer = async (req, res) => {
  const answer = await Answer.create({
      
  })
}

const createQuestion = async (req, res) => {

  const {questionText, questionType, optionIds, optionTexts} = req.body

  if(optionIds && optionTexts) {
    return res.status(400).json({
      status: "failure",
      code: 400,
      msg: "Only one of optionsIds and optionTexts should be provided"
    })
  }
  if(optionIds) {
      //check if it is an array
      if(!Array.isArray(optionIds)){
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "optionsIds must be an array"
        })
      }

      // check if optionsIds exist
      let exist = true
      for (const option of optionIds) {
          const opt = await Option.findById(option)
          if(!opt){
            exist = false;
            break;
          }
      }

      if(exist == false) {
        return res.status(400).json({
          status: "failure",
          code: 400,
          msg: "The optionIds must exist. The options must have been created"
        })
      }

      const question = await Question.create({
        questionText,
        questionType,
        options: optionIds
      })
  } else if (optionTexts) {
    //check if it is an array
    if(!Array.isArray(optionTexts)){
      return res.status(400).json({
          status: "failure",
          code: 400,
          msg: "optionTexts must be an array"
      })
    }

    // create options in db
    let newOptionsIds = []
    for (const text of optionTexts) {
      const option = await Option.create({
        text
      })
      newOptionsIds.push(option._id)
    }

    const question = await Question.create({
      questionText,
      questionType,
      options: newOptionsIds
    })

  } else {
    const question = await Question.create({
      questionText,
      questionType
    })
  }

  res.status(201).json({
    status: "success",
    code: 201,
    msg: "Question successfully created"
  }) 

 
}





const getPrice = async (req, res) => {
    try {
        const { userId } = req;
        const { surveyId } = req.body;

        const survey = await Survey.findById(surveyId);
        const user = await User.findOne({ id: userId });

      if (!survey.user_id.equals(user._id)) {
        return res.status(400).json({error: "No survey Found"})
      }

        // Constants
        const BASE_RATE = 500;
        const QUESTION_RATE = 10;
        const PARTICIPANT_RATE = 40;

        // Calculate total price
        const numQuestions = survey.questions.length;
        const numParticipants = survey.no_of_participants;
        
        const amount_to_be_paid = BASE_RATE + 
            (QUESTION_RATE * numQuestions) + 
            (PARTICIPANT_RATE * numParticipants);

        // Calculate points per user
        const points_per_user = Math.ceil((QUESTION_RATE * numQuestions + PARTICIPANT_RATE * numParticipants) / numParticipants);

        // Update survey with calculated values
        await Survey.findByIdAndUpdate(surveyId, {
            amount_to_be_paid: amount_to_be_paid,
            point_per_user: points_per_user
        });
        
        let responsePayload = {
            price: amount_to_be_paid,
            points_per_user: points_per_user,
            surveyId
        };

      // Generate a JWT to store this data temporarily
      const token = jwt.sign(responsePayload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      }); // Token expires in 15 minutes
      return res.status(200).json({ ...responsePayload, token });
    } catch (error) {
      console.error("Error in get-price route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};

// nearest future , can send those error to the frontend pricing
const receivePaymentWebhook = async (req, res) => {
    const DB_KEY = process.env.DB_KEY
    try {
      const { db_key } = req.query;
      if (!db_key) {
        return res.status(401).json({
          status: 401,
          success: false,
        });
      }
      if (db_key != DB_KEY) {
        return res.status(401).json({
          status: 401,
          success: false,
          error: "check",
        });
      }

      let id_ = req.body.data.reference;

      //validate event
      // const payload = JSON.stringify(req.body);

      // const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');

      // console.log(hash)
      // console.log(req.headers['x-paystack-signature'])
      //     if (hash == req.headers['x-paystack-signature']) {
      // Retrieve the request's body
      const event = req.body;
      console.log(event);

      // check if customer has been proccessed
      // const check_customer = await Payment.find({ referenceNumber: id_ });

      // if (check_customer.length > 0) {
      //   console.log("true proccesed");
      //   return res.status(400).json({
      //     status: 400,
      //     success: false,
      //     message: "payment processed",
      //   });;
      // }

      switch (event.event) {
        case "charge.create":
          // Handle successful payment event
          break;

        case "charge.success":
          const dataToSend = {
            email: event.data.customer.email,
            token: event.data.metadata.custom_fields[0].value,
            amount: event.data.amount,
          };
          const { email, token, amount } = dataToSend;

          const user = await User.findOne({ email });
          if (!user) {
            console.log("User not found")
            return res.status(404).json({ error: "User not found" });
          }
          const userId = user.userId;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log(amount)
          console.log(decoded.price)

          const amountInNaira = Number(amount) / 100; // Convert amount to naira
          if ( amountInNaira !== decoded.price) {
            console.log("Invalid plan or amount")
            return res.status(400).json({ error: "Invalid plan or amount" });
            // send notification
          }

          const newPayment = new Payment({
            userId: userId,
            referenceNumber: id_,
            surveyId: decoded.surveyId,
            amount: amountInNaira,            
            email,
            datePaid: new Date()
          });
          await newPayment.save();

          res.status(200).json({
            message:
              "Payment collected successfully and plan updated",
          });

          break;

        default:
          console.log("Unhandled event:", event);
      }
    } catch (error) {
      console.log(error);
      if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ error: "Payment Processing timeout" });
      }
      res.status(500).json({ error: error.message });
    }
  }

const mySurveys = async (req, res) => {
  const {userId} = req;
  try {
    const user = await User.findOne({id: userId})
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const surveys = await Survey.find({user_id: user._id}).sort({createdAt: -1});
    const surveysWithCounts = surveys.map(survey => {
      const filledCount = survey.submittedUsers.length;
      const remainingSpots = survey.no_of_participants - filledCount;
      
      return {
        ...survey.toObject(),
        participantCounts: {
          filled: filledCount,
          remaining: remainingSpots,
          total: survey.no_of_participants
        }
      };
    });

    res.status(200).json({ 
      status: "success", 
      code: 200, 
      mySurveys: surveysWithCounts 
    });
  } catch (error) {
    res.status(500).json({ 
      status: "failure", 
      code: 500, 
      error: "Internal server error" 
    });
  }
};





const testController = async (req, res) => {

    const survey =  await Survey
}

const verifyPayment = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { userId } = req;

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({
                status: "failure",
                code: 404,
                msg: "User not found"
            });
        }

        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({
                status: "failure",
                code: 404,
                msg: "Survey not found"
            });
        }

        // Check if user owns the survey
        if (!survey.user_id.equals(user._id)) {
            return res.status(403).json({
                status: "failure",
                code: 403,
                msg: "Unauthorized access"
            });
        }

        // Check if payment exists for this survey
        const payment = await Payment.findOne({ surveyId }).sort({ createdAt: -1 });
        
        if (!payment) {
            return res.status(400).json({
                status: "success",
                code: 400,
                paid: false,
                msg: "No payment found for this survey"
            });
        }

        // Calculate expected payment amount
        const BASE_RATE = 500;
        const QUESTION_RATE = 10;
        const PARTICIPANT_RATE = 40;

        const numQuestions = survey.questions.length;
        const numParticipants = survey.no_of_participants;
        
        const expectedAmount = BASE_RATE + 
            (QUESTION_RATE * numQuestions) + 
            (PARTICIPANT_RATE * numParticipants);

        // Check if the payment amount matches the expected amount
        const isCorrectPayment = payment.amount === expectedAmount;
        if (!isCorrectPayment) {
          return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "Payment amount does not match expected price"
          });
        }

        return res.status(200).json({
            status: "success",
            code: 200,
            paid: true,
            correctPayment: isCorrectPayment,
            expectedAmount: expectedAmount,
            payment: {
                amount: payment.amount,
                datePaid: payment.datePaid,
                referenceNumber: payment.referenceNumber
            },
            msg: isCorrectPayment 
                ? "Payment verified successfully" 
                : "Payment found but amount does not match expected price"
        });

    } catch (error) {
        console.error("Error in verify-payment route:", error);
        res.status(500).json({
            status: "failure",
            code: 500,
            msg: "Internal server error"
        });
    }
};

// Add this new controller function after the getSurveyAnalytics function
const exportSurveyData = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { format = 'csv', style = 'google' } = req.query; // Default format is CSV in Google style

    // First find the current user
    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'User not found' });
    }

    // Get the survey with all related data
    const survey = await Survey.findById(surveyId)
      .populate({
        path: 'user_id',
        select: 'fullname email instituition'
      });

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    // Security check: Only the survey creator can export data
    if (!survey.user_id._id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'You are not authorized to export this survey data' });
    }

    // Get user information for all respondents to include email
    const respondentUserIds = survey.submittedUsers.map(userId => userId);
    const respondents = await User.find({ _id: { $in: respondentUserIds } })
      .select('_id email fullname');

    // Create a map of user IDs to user data for quick lookup
    const userMap = new Map();
    respondents.forEach(respondent => {
      userMap.set(respondent._id.toString(), respondent);
    });

    if (format === 'csv') {
      // Process the survey data for CSV format with user emails
      const formattedData = formatSurveyDataForCsv(survey, userMap);
      
      let csvContent;
      
      if (style === 'google') {
        // Use Google Forms style CSV (questions as columns, respondents as rows)
        csvContent = createCsvString(formattedData.googleStyleData);
      } else {
        // Use the original format with sections
        const surveyInfoCsv = createCsvString([formattedData.surveyInfo]);
        const questionResponsesCsv = createCsvString(formattedData.questionResponses);
        const individualResponsesCsv = createCsvString(formattedData.individualResponses);
        
        // Combine all sections with section headers
        csvContent = [
          '# SURVEY INFORMATION',
          surveyInfoCsv,
          '\n# QUESTION ANALYTICS',
          questionResponsesCsv,
          '\n# INDIVIDUAL RESPONSES',
          individualResponsesCsv
        ].join('\n\n');
      }
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export_${Date.now()}.csv"`);
      
      // Send the CSV content
      return res.status(200).send(csvContent);
    } else {
      return res.status(400).json({ status: "failure", code: 400, msg: `Unsupported export format: ${format}` });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  start,
  home, 
  createSurvey,
  updateAnswer,
  testController,
  updateAnswer,
  submitAnswers,
  checkSurveyMaxParticipants,
  checkUserFilledSurvey,
  addOrUpdateQuestion,
  deleteQuestion,
  getSurveyAnalytics,
  getSurveyInfo,
  getSurveyQuestions,
  getAllSurveys,
  getUserSurveyData,
  publishSurvey,
  receivePaymentWebhook,
  getPrice,
  mySurveys,
  verifyPayment,
  uploadQuestionnaire,
  bulkAddOrUpdateQuestions,
  exportSurveyData
}