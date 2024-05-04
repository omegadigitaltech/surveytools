const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const jwtSecret = process.env.JWT_SECRET
const { generateID_users, getVerification} = require('../middleware/helper');
const {url}  = require('../middleware/helper')

const postRegister = async (req,res) => {

    const {first_name, last_name, password, confirm_password, email, department} = req.body

    // check for password
    if(!password || !confirm_password){
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "You must fill in a password"
        })
    }
    // confirm password
    if(password != confirm_password ) {
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "The passwords does not match"
        })
    }
    //hash passwprd
    const hashedPassword = await bcrypt.hash(password, 10)

    // generate unique ID
    var unique_id = await generateID_users(16)

    // check if id isnt present
    var check_uniqueId = await User.find({id: unique_id})
    while(check_uniqueId.length > 0){
        unique_id = await generateUniqueID_user()
        check_uniqueId = await User.find({id: unique_id})
    }

    // get fullname
    const fullname = first_name + " " + last_name

    // check for uniqueness of email
    const check_email = await User.find({email: email})
    if (check_email.length > 0) {
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "User exists"
        })
    }

    const user = await User.create({
        id: unique_id,  
        type: "Normal",
        fullname, 
        email, 
        department,
        password: hashedPassword,
    })

    // send verification code to their email.
    const {verified} = await getVerification(user.id)
    let redirectUrl = url;
    if(verified == true){
        redirectUrl = req.session.referer || url;
    } else {
        redirectUrl =  url + '/verification'; // if not verified redirect to verification page
    }
    
    const token =  await jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})

    res.status(201).json({
        status: "success",
        code: 201,
        msg: "User successfully created and signed in",
        data: {
            redirectUrl: redirectUrl
        }
    })
    
}

const postLogin = async (req, res) => {
    const {email, password} = req.body


    const user = await User.findOne({email})

    if(!user) {
        return res.status(404).json({
            status: "failure",
            code: 404,
            msg: "Invalid credentials"
        })
    }
    if(!user.password) {
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: `User ${user.email} uses ${user.type} Login`
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
        return res.status(401).json({
            status: "failure",
            code: 401,
            msg: "Invalid credentials"
        })
    }


    // send verification code to their email.
    const {verified} = await getVerification(user.id)
    let redirectUrl;
    if(verified == true){
        redirectUrl = req.session.referer || url;
    } else {
        redirectUrl =  url + '/verification'; // if not verified redirect to verification page
    }
    
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})

    res.status(200).json({
        status: "success",
        code: 200,
        msg: "User successfully logged in",
        data: {
            redirectUrl: redirectUrl
        }
    })
}

const googleLogin = async (req, res) => {
    // send verification code to their email.
    if(req.user){
        if(req.user.error) {
          let error = req.user.error
          return res.redirect(`/login?error=${error}`)
        }
    }
    const {verified} = await getVerification(req.user.id)
    let redirectUrl;
    if(verified == true){
        redirectUrl = req.session.referer || url;
    } else {
        redirectUrl =  url + '/verification'; // if not verified redirect to verification page
    }

    const token = jwt.sign({userId: req.user.id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})
    res.redirect(redirectUrl)
}


const facebookLogin = async (req, res) => {
    if(req.user){
        if(req.user.error) {
          let error = req.user.error
          return res.redirect(`/login?error=${error}`)
        }
    }
    // send verification code to their email.
    const {verified} = await getVerification(req.user.id)
    let redirectUrl;
    if(verified == true){
        redirectUrl = req.session.referer || url;
    } else {
        redirectUrl =  url + '/verification'; // if not verified redirect to verification page
    }

    const token = jwt.sign({userId: req.user.id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})
    res.redirect(redirectUrl)
}

const verify = async (req, res) => {

    const user = await User.findOne({id: req.userId})
    if (user.verified == true){
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "User verified"
        })
    }
    const {code} = req.body
  
    let code_ = parseInt(code)
    if(code_ == user.code){
      const user_ = await User.findOneAndUpdate({id: req.userId}, {verified: true, code: null}, {new: true})
      return res.status(200).json({
        status: "success",
        code: 200,
        msg: "User verified"
      })
    } else {
        return res.status(400).json({
            status: "failure",
            code: 400,
            msg: "OTP invalid or expired"
        })
    }
}


const isLoggedIn = async (req, res ) => {
    try {
      req.session.referer = req.originalUrl
      const token = req.cookies.token;
    
      if(!token) {
        return res.status(401).json({
            status: "failure",
            code: 401,
            msg: "User is not Logged in",
            data: {
                isLoggedIn: false,
            }
        })
      }
    
      const decoded = jwt.verify(token, jwtSecret);
      //dont just find by Id, but by password
      const user = await User.find({id: decoded.userId})
      if(!user) {
        return res.status(401).json({
            status: "failure",
            code: 401,
            msg: "Token error. User not found",
            data: {
                isLoggedIn: false,
            }
        })
      }

      res.status(200).json({
        status: "success",
        code: 200,
        msg: "User is Logged in",
        data: {
            isLoggedIn: true,
        }
      })
    } catch(error) {
        console.log(error)
        req.session.referer = req.originalUrl
        if(error instanceof jwt.JsonWebTokenError){
          res.clearCookie('token');
        }
        res.status(401).json({
            status: "failure",
            code: 401,
            msg: "An Error Occured: User is not Logged in",
            data: {
                isLoggedIn: false,
                error: error
            }
        })
    }
  
}

const failurePage = async (req,res) => {
    res.send('Something went wrong')
}


const logout = async (req, res) => {
    res.clearCookie('token');
    req.logout(function(err) {
        if (err) { return next(err); }
        res.status(200).json({
            status: "success",
            code: 200,
            msg: "Successfully logged out"
        })
    });
}

module.exports = {
    getVerification,
    verify,
    failurePage,
    postLogin,
    logout,
    postRegister,
    isLoggedIn,
    googleLogin,
    facebookLogin
}