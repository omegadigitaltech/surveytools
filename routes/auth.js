const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth');
const { getVerification, verify, failurePage, postLogin, logout, isLoggedIn, googleLogin, facebookLogin, postRegister, updateUser} = require('../controllers/auth');
const passport = require("passport");
const jwt = require('jsonwebtoken')


router.get('/auth/google',  passport.authenticate('google', { scope:
  [ 'email', 'profile' ] }
))
// callback
router.get('/google', passport.authenticate( 'google', { failureRedirect: '/login?error=Gooogle Login Failed' }), googleLogin)

router.get('/auth/facebook', passport.authenticate('facebook'))
//callback
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login?error=Facebook Login Failed '  }), facebookLogin)

// is logged in route
router.get('/isLoggedIn', isLoggedIn)

router.post('/verify',authMiddleware, verify)
router.get('/failure', failurePage)

router.post('/login', postLogin)
router.post('/register', postRegister)

router.get('/auth/logout', logout)

// update user
router.patch('/update-user', authMiddleware, updateUser)

module.exports = router