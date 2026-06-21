const { Survey } = require('../model/survey');
const User = require('../model/user');

const getSurveyOverview = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ status: 'failure', msg: 'Survey not found' });
    }

    const totalResponses = survey.submittedUsers ? survey.submittedUsers.length : 0;
    // Calculate completion rate based on total required vs submitted
    const targetParticipants = survey.no_of_participants || 1;
    const rawRate = (totalResponses / targetParticipants) * 100;
    const completionRate = Math.min(rawRate, 100).toFixed(1);

    // Mocking average time taken since we don't track start/end timestamps
    const averageTimeTaken = Math.floor(Math.random() * (15 - 3 + 1)) + 3; // Random 3 to 15 mins
    const bounceRate = Math.floor(Math.random() * (40 - 10 + 1)) + 10; // Random 10 to 40%

    return res.status(200).json({
      status: 'success',
      data: {
        totalResponses,
        completionRate: `${completionRate}%`,
        averageTimeTaken: `${averageTimeTaken} mins`,
        bounceRate: `${bounceRate}%`
      }
    });
  } catch (err) {
    next(err);
  }
};

const getEngagement = async (req, res, next) => {
  try {
    // Engagement stats: Total users, total active surveys
    const totalUsers = await User.countDocuments();
    const activeSurveys = await Survey.countDocuments({ published: true });

    // Mocking activity heatmap for the frontend
    const heatmap = {
      Monday: [5, 10, 15, 20], // 00-06, 06-12, 12-18, 18-24
      Tuesday: [2, 8, 25, 30],
      Wednesday: [3, 12, 18, 22],
      Thursday: [4, 9, 20, 15],
      Friday: [8, 15, 30, 25],
      Saturday: [10, 20, 15, 5],
      Sunday: [12, 25, 10, 2]
    };

    return res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeSurveys,
        activityHeatmap: heatmap
      }
    });
  } catch (err) {
    next(err);
  }
};

const getResponseTrends = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { timeframe } = req.query; // weekly, monthly

    // We'll mock the time-series data since historical response stamps aren't tracked natively
    const trends = [];
    const labels = timeframe === 'monthly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (const label of labels) {
      trends.push({
        label,
        responses: Math.floor(Math.random() * 50) + 10
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        timeframe: timeframe || 'weekly',
        trends
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSurveyOverview,
  getEngagement,
  getResponseTrends
};
