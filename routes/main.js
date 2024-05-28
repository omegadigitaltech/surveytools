const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth')


const {start, home, postSurvey} = require('../controllers/main')


router.get('/', start)
router.get('/home', authMiddleware, home)
router.post('/create-survey', authMiddleware, postSurvey)

module.exports = router