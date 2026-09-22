const { Survey } = require('../../model/survey');
const DemographicAggregate = require('../../model/demographic-aggregate');
const ResearcherProfile = require('../kyc/researcher-profile.model');

async function getOrgWideStats(orgUserId) {
  const surveys = await Survey.find({ user_id: orgUserId });
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.published).length;
  const totalResponses = surveys.reduce((acc, s) => acc + (s.participants || 0), 0);

  return {
    totalSurveys,
    activeSurveys,
    totalResponses
  };
}

async function getAggregatedDemographics(surveyId, filters) {
  const match = { surveyId };
  if (filters && filters.length > 0) {
    match.field = { $in: filters };
  }
  const aggregates = await DemographicAggregate.find(match);
  
  const result = {};
  for (const agg of aggregates) {
    if (!result[agg.field]) result[agg.field] = [];
    result[agg.field].push({ value: agg.value, count: agg.count });
  }
  return result;
}

async function getSurveysForExport(surveyId, orgUserId) {
  const survey = await Survey.findOne({ _id: surveyId, user_id: orgUserId }).populate('questions.answers');
  return survey;
}

async function getOrgBillingDetails(userId) {
  // Note: userId here is the string User.id matched in ResearcherProfile.userId
  const profile = await ResearcherProfile.findOne({ userId });
  return profile;
}

module.exports = {
  getOrgWideStats,
  getAggregatedDemographics,
  getSurveysForExport,
  getOrgBillingDetails
};
