const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth')


const {start, home, postSurvey, createSurvey} = require('../controllers/main')


router.get('/', start)
router.get('/home', authMiddleware, home)
// router.post('/create-survey', authMiddleware, postSurvey)
router.post('/create-survey', authMiddleware, createSurvey)


module.exports = router