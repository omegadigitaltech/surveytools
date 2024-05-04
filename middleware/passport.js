require('express-async-errors');
const { StatusCodes } = require('http-status-codes')
const passport = require("passport");
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../model/user")

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/google",
    passReqToCallback: true
  }, 
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      if(!profile.email){
        return done(null, {error: "Email not Found", statusCode: 404})
      }
      await User.findOneAndUpdate({ id: profile.id }, {id: profile.id, type: "Google", fullname: profile.displayName, email: profile.email }, {upsert: true, new: true, runValidators: true})
      done(null, profile);

    } catch (err) {

      let msg = "An error Occured"
      let statusCode = 500
      if(err.name === 'ValidationError'){
        msg = Object.values(err.errors).map((item) => item.message).join(',')
        statusCode = 400
      }
    
      if(err.code && err.code === 11000){
        msg = `Duplicate Value entered for ${Object.keys(err.keyValue)} field, please choose another value`
        statusCode = StatusCodes.BAD_REQUEST
      }
      
      return done(null, {error: msg, statusCode: statusCode})
    }
    
  }
));
  
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      console.log(profile)
      if(!profile.email){
        return done(null, {error: "Email not Found", statusCode: 404})
      }
      await User.findOneAndUpdate({ id: profile.id }, {id: profile.id, type: "Facebook"}, {upsert: true, new: true, runValidators: true})
      done(null, profile);
    } catch (err) {
      let msg = "An error Occured"
      let statusCode = 500
      if(err.name === 'ValidationError'){
        msg = Object.values(err.errors).map((item) => item.message).join(',')
        statusCode = 400
      }
    
      if(err.code && err.code === 11000){
        msg = `Duplicate Value entered for ${Object.keys(err.keyValue)} field, please choose another value`
        statusCode = StatusCodes.BAD_REQUEST
      }
      
      return done(null, {error: msg, statusCode: statusCode})
    }
     
  }
));
  
passport.serializeUser((user, done) => {
  done(null, user)
})
  
passport.deserializeUser((user, done) => {
  done(null, user)
})