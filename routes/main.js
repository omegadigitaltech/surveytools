
const {authMiddleware} = require('../middleware/auth')
const express = require('express');
const router = express.Router();
const { start, home,updateAnswer, submitAnswers, createSurvey, 
    deleteQuestion, getSurveyInfo, getUserSurveyData, 
    checkUserFilledSurvey, checkSurveyMaxParticipants, addOrUpdateQuestion,
  getSurveyAnalytics, getSurveyQuestions,  getAllSurveys, publishSurvey, testController
 } = require('../controllers/main')


// Answer-related endpoints
router.put('/questions/:questionId/answers', updateAnswer);
router.post('/surveys/:surveyId/submit', submitAnswers);

// Survey-related endpoints
router.post('/surveys', createSurvey);
router.post('/surveys/:surveyId/questions', addOrUpdateQuestion);
router.delete('/surveys/:surveyId/questions/:questionId', deleteQuestion);
router.get('/surveys/:surveyId/info', getSurveyInfo);
router.get('/surveys/:surveyId/user-data', getUserSurveyData);
router.get('/surveys/:surveyId/user-filled', checkUserFilledSurvey);
router.get('/surveys/:surveyId/max-participants', checkSurveyMaxParticipants);
router.get('/surveys', getAllSurveys);
router.get('/surveys/:surveyId/questions', getSurveyQuestions);
router.post('/surveys/:surveyId/publish', publishSurvey);
router.get('/surveys/:surveyId/analytics', getSurveyAnalytics);

module.exports = router;



// router.get('/', start)
// router.get('/home', authMiddleware, home)
// // router.post('/create-survey', authMiddleware, postSurvey)
// router.post('/create-survey', authMiddleware, createSurvey)
// router.post('/update-answer/:questionId', authMiddleware, updateAnswers)

// router.post('/test', authMiddleware, testController)

