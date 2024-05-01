const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth')


const {start, home} = require('../controllers/main')


router.get('/', start)
router.get('/home', authMiddleware, home)


module.exports = router