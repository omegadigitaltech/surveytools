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
    if(!profile.email){
      return done(null, {error: "Email not Found"})
    }
    await User.findOneAndUpdate({ id: profile.id }, {id: profile.id, type: "Google", fullname: profile.displayName, email: profile.email }, {upsert: true, new: true, runValidators: true})
    done(null, profile);
  }
));
  
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    if(!profile.email){
      return done(null, {error: "Email not Found"})
    }
    await User.findOneAndUpdate({ id: profile.id }, {id: profile.id, type: "Facebook"}, {upsert: true, new: true, runValidators: true})
    done(null, profile);
    
  }
));
  
passport.serializeUser((user, done) => {
  done(null, user)
})
  
passport.deserializeUser((user, done) => {
  done(null, user)
})