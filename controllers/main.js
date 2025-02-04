const path = require('path')
const {Survey, Option, Question, Answer} = require('../model/survey')
const User = require('../model/user')
const Payment = require('../model/payment')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const mongoose = require('mongoose');
const {calculateSentiment} = require('../middleware/helper')

const main_url = "localhost:5000"

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
    const amount = no_of_participants * 100
    const survey = await Survey.create([{
      user_id: user._id,
      title,
      description,
      preferred_participants,
      gender,
      no_of_participants,
      amount_to_be_paid: amount
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

    if (survey.participants >= survey.max_participant) {
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

        if (question.analytics.distribution && question.analytics.distribution.size > 0) {
          const maxResponse = [...question.analytics.distribution.entries()].reduce((a, b) => b[1] > a[1] ? b : a, [null, 0]);
          question.analytics.mostCommonResponse = maxResponse[0];
        } else {
          question.analytics.mostCommonResponse = null; // Fallback if there are no responses yet
        }

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
    if (questionType === 'multiple_choice' && Array.isArray(options)) {
      formattedOptions = options.map(option => ({
        text: option // Convert each option string to an object with `text` property
      }));
    }

  
    const question = survey.questions.find(q => q._id.toString() === questionId);
    if (question) {
      question.questionText = questionText;
      question.questionType = questionType;
      question.required = required !== undefined ? required : question.required; // Use existing value if undefined
      question.options = questionType === 'multiple_choice' ? formattedOptions : [];
      survey.updatedAt = new Date();
    } else {
      survey.questions.push({
        questionText,
        questionType,
        required,
        options,
        required: required || false,
        options: questionType === 'multiple_choice' ? formattedOptions : []

      });
      survey.updatedAt = new Date();
    }

    await survey.save();

    res.status(200).json({ status: "success", code: 200, msg: 'Question added/updated successfully', survey });
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
    const user = await User.findOne({ id: req.userId });
    if (!survey) {
      return res.status(404).json({ status: "failure", code: 404, msg: 'Survey not found' });
    }

    if (!survey.user_id.equals(user._id)) {
      return res.status(403).json({ status: "failure", code: 403, msg: 'User not authorized to publish this survey' });
    }

    const payment = await Payment.findOne({surveyId})
    if(!payment){
      return res.status(400).json({ status: "failure", code: 400, msg: 'No payment found' });
    }

    survey.published = true;
    survey.link = `https://${main_url}/surveys/${surveyId}/info`;
    await survey.save();

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
        select: 'fullname email instituition pic_url' // Select only the fields you want to return
      });
      
    res.status(200).json({ 
      status: "success", 
      code: 200, 
      surveys 
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
      const { userId  } = req;
      const { surveyId } = req.body;

      const survey = await Survey.findById(surveyId)
      const user = await User.findOne({ id: userId });

      if (!survey.user_id.equals(user._id)) {
        return res.status(400).json({error: "No survey Found"})
      }

      const amount_to_be_paid = survey.amount_to_be_paid
      
      let responsePayload = {
        price: amount_to_be_paid,
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
  }

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
            return res.status(404).json({ error: "User not found" });
          }
          const userId = user.userId;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          if ( Number(amount) !== decoded.price) {
            return res.status(400).json({ error: "Invalid plan or amount" });
            // send notification
          }

          const newPayment = new Payment({
            userId: userId,
            referenceNumber: id_,
            surveyId: decoded.surveyId,
            amount,            
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
  publishSurvey,
  receivePaymentWebhook,
  getPrice
}