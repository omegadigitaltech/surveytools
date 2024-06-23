const path = require('path')
const {Survey, Option, Question, Answer} = require('../model/survey')
const User = require('../model/user')

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

const postSurvey = async (req, res) => {
    const {title, description, max_participant, point, duration, preferred_participants } = req.body
    const user = await User.findOne({id: req.userId})
    
    if(!user){
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User Not Found"
      })
    }

    // check that user has department filled
    if(!user.department){
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
      max_participant,
    })

    res.status(201).json({
      status: "success",
      code: 201,
      msg: `Survey successfully created by ${user.fullname}`,
  })
}

// Example usage
const createSurvey = async (req, res) => {
  const {title, description, max_participant, point, duration, preferred_participants, questions, questionType, optionTexts } = req.body
  const user = await User.findOne({id: req.userId})
  
  if(!user){
    return res.status(404).json({
      status: "failure",
      code: 404,
      msg: "User Not Found"
    })
  }

  // check that user has department filled
  if(!user.department){
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
    max_participant,
    questions: questions
  })

  res.status(201).json({
    status: "success",
    code: 201,
    msg: `Survey successfully created by ${user.fullname}`,
})
}

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

module.exports = {
  start,
  home, 
  postSurvey,
  createSurvey
}