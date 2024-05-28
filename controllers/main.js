const path = require('path')
const Survey = require('../model/survey')
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

module.exports = {
  start,
  home, 
  postSurvey
}