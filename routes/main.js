const {authMiddleware} = require('../middleware/auth')
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { start, home,updateAnswer, submitAnswers, createSurvey, 
    deleteQuestion, getSurveyInfo, getUserSurveyData, 
    checkUserFilledSurvey, checkSurveyMaxParticipants, addOrUpdateQuestion,
  getSurveyAnalytics, getSurveyQuestions,  getAllSurveys, publishSurvey, testController,
  receivePaymentWebhook,
  getPrice,
  mySurveys,
  verifyPayment,
  uploadQuestionnaire,
  bulkAddOrUpdateQuestions,
  exportSurveyData,
  unpublishSurvey
 } = require('../controllers/main');
const formRouter = require('./form');


// Answer-related endpoints
router.put('/questions/:questionId/answers', authMiddleware, updateAnswer);
router.post('/surveys/:surveyId/submit',authMiddleware, submitAnswers);

// Survey-related endpoints
router.post('/surveys', authMiddleware, createSurvey);
router.post('/surveys/:surveyId/questions', authMiddleware, addOrUpdateQuestion);
router.post('/surveys/:surveyId/bulk-questions', authMiddleware, bulkAddOrUpdateQuestions);
router.delete('/surveys/:surveyId/questions/:questionId', authMiddleware, deleteQuestion);
router.get('/surveys/:surveyId/info',authMiddleware, getSurveyInfo);
router.get('/surveys/:surveyId/user-data', authMiddleware, getUserSurveyData);
router.get('/surveys/:surveyId/user-submitted',authMiddleware, checkUserFilledSurvey);
router.get('/surveys/:surveyId/max-participants',authMiddleware, checkSurveyMaxParticipants);
router.get('/surveys',authMiddleware, getAllSurveys);
router.get('/surveys/:surveyId/questions',authMiddleware, getSurveyQuestions);
router.post('/surveys/:surveyId/publish',authMiddleware, publishSurvey);
router.post('/surveys/:surveyId/unpublish', authMiddleware, unpublishSurvey);
router.get('/surveys/:surveyId/analytics',authMiddleware, getSurveyAnalytics);
router.get('/surveys/:surveyId/verify-payment', authMiddleware, verifyPayment);
router.get('/surveys/:surveyId/export', authMiddleware, exportSurveyData);

// Questionnaire document upload endpoint - now takes surveyId in the URL
router.post('/surveys/:surveyId/upload-questionnaire', authMiddleware, upload.single('document'), uploadQuestionnaire);

router.post('/payment-webhook', receivePaymentWebhook)
router.post('/get-price', authMiddleware, getPrice)
router.get('/my-surveys', authMiddleware, mySurveys)

router.use("/forms", formRouter)

module.exports = router;



// router.get('/', start)
// router.get('/home', authMiddleware, home)
// // router.post('/create-survey', authMiddleware, postSurvey)
// router.post('/create-survey', authMiddleware, createSurvey)
// router.post('/update-answer/:questionId', authMiddleware, updateAnswers)

// router.post('/test', authMiddleware, testController)

