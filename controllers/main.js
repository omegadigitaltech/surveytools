const path = require('path')
const {Survey, Option, Question, Answer} = require('../model/survey')
const User = require('../model/user')
const mongoose = require('mongoose');
const {calculateSentiment} = require('../middleware/helper')

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
    const {title, description, max_participant, point, duration, preferred_participants } = req.body
    const user = await User.findOne({id: req.userId})
    
    if(!user){
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User Not Found"
      })
    }
  
    // check that user has department filled
    if(!user.department){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "To create a survey, fill in your department"
      })
    }
  
    const survey = await Survey.create({
      user_id: user._id,
      title,
      description,
      point,
      duration,
      preferred_participants,
      max_participant
    })
  
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      status: "success",
      code: 201,
      msg: `Survey successfully created by ${user.fullname}`,
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}



// Not really needed. As could affect the response analytics if eventually not submitted. Best to save in frontend
const updateAnswer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: "failure", code: 404, msg: 'Question not found' });
    }

    const question = survey.questions.find(q => q._id === questionId);
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

    if (survey.participants >= survey.max_participant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has reached maximum participants' });
    }

    // Validate response for five_point and multiple_choice questions
    if (question.questionType === 'five_point') {
      if (parseInt(response)  < 1 || parseInt(response) > 5) {
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
    }


    const existingAnswer = question.answers.find(a => a.userId.equals(user._id));
    if (existingAnswer) {
      existingAnswer.response = response;
    } else {
      question.answers.push({ fullname: user.fullname, response, userId: user._id });
    }

    await survey.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: "success", code: 200, msg: `Answer successfully updated by ${user.fullname}` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    if (survey.published == false) {
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has not been published' });
    }

    if (survey.submittedUsers.includes(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'User has already submitted the survey' });
    }

    if (survey.participants >= survey.max_participant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: "failure", code: 400, msg: 'Survey has reached maximum participants' });
    }

    // Validate answers structure
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

      if (answer) {
        // Validate response for five_point and multiple_choice questions
        if (question.questionType === 'five_point') {
          if (parseInt(answer.response) < 1 || parseInt(answer.response) > 5) {
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
        }

        const existingAnswer = question.answers.find(a => a.userId.equals(user._id));
        if (existingAnswer) {
          existingAnswer.response = answer.response;
        } else {
          question.answers.push({ fullname: user.fullname, response: answer.response, userId: user._id });
        }

        question.analytics.totalResponses += 1;
        if (question.questionType === 'multiple_choice' || question.questionType === 'five_point') {
          question.analytics.distribution.set(answer.response, (question.analytics.distribution.get(answer.response) || 0) + 1);
          if (question.questionType === 'five_point') {
            question.analytics.averageRating = (question.analytics.averageRating * (question.analytics.totalResponses - 1) + parseInt(answer.response)) / question.analytics.totalResponses;
          }
        }

        if (question.questionType === 'fill_in') {
          const fillInResponses = question.answers;
          const sentimentAnalysis = await calculateSentiment(fillInResponses);
          question.analytics.sentimentAnalysis = sentimentAnalysis;
        }

        const maxResponse = [...question.analytics.distribution.entries()].reduce((a, b) => b[1] > a[1] ? b : a);
        question.analytics.mostCommonResponse = maxResponse[0];
        question.analytics.responseRate = `${((question.analytics.totalResponses / survey.max_participant) * 100).toFixed(2)}%`;
      }
    }

    survey.participants += 1;
    survey.submittedUsers.push(user._id);

    await survey.save({ session });

    user.pointBalance += survey.point
    await user.save({ session })

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: "success", code: 200, msg: 'Survey successfully submitted' });
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
      return res.status(200).json({ status: "success", code: 200, filled: true });
    }

    res.status(200).json({ status: "success", code: 200, filled: false });
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

    if (survey.participants >= survey.max_participant) {
      return res.status(200).json({ status: "success", code: 200, maxReached: true });
    }

    res.status(200).json({ status: "success", code: 200, maxReached: false });
  } catch (error) {
    next(error);
  }
};

// Add or update question
const addOrUpdateQuestion = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { questionId, questionText, questionType, required, options } = req.body;

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


    const question = survey.find(q => q._id === questionId);
    if (question) {
      question.questionText = questionText;
      question.questionType = questionType;
      question.required = required;
      question.options = options;
      survey.updatedAt = new Date();
    } else {
      survey.questions.push({
        questionText,
        questionType,
        required,
        options,
      });
      survey.updatedAt = new Date();
    }

    await survey.save();

    res.status(200).json({ status: "success", code: 200, msg: 'Question added/updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Edit survey information
const editSurveyInfo = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const {title, description, max_participant, point, duration, preferred_participants } = req.body

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
      {title, description, max_participant,
         point, duration, preferred_participants 
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

    const questionIndex = survey.questions.findIndex(q => q._id === questionId);
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
    const survey = await Survey.findById(surveyId).select('title description participants preferred_participants max_participant point duration createdAt updatedAt');

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    res.status(200).json({ status: "success", code: 200, survey });
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

    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to publish this survey' });
    }


    survey.published = true;
    survey.link = `https://yourapp.com/surveys/${surveyId}`;
    await survey.save();

    res.status(200).json({ status: "success", code: 200, msg: 'Survey published', link: survey.link });
  } catch (error) {
    next(error);
  }
};


const getAllSurveys = async (req, res, next) => {
  try {
    const surveys = await Survey.find({published: true}).select('title description point duration max_participant createdAt updatedAt');
    res.status(200).json({ status: "success", code: 200, surveys });
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

const testController = async (req, res) => {

    const survey =  await Survey
}

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
  publishSurvey
}