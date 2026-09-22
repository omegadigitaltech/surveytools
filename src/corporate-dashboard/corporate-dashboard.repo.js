'use strict';

/**
 * @param {{ Survey: object, DemographicAggregate: object, ResearcherProfile: object }} dependencies
 * @returns {object}
 */
function createCorporateDashboardRepo({ Survey, DemographicAggregate, ResearcherProfile }) {
  
  /**
   * Gets organization-wide statistics
   * @param {string} orgUserId - The organization's user ID
   * @returns {Promise<{totalSurveys: number, activeSurveys: number, totalResponses: number}>}
   */
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

  /**
   * Retrieves and groups demographic aggregates for a given survey
   * @param {string} surveyId - The survey ID to query
   * @param {string[]} [filters] - Optional array of fields to filter by
   * @returns {Promise<object>}
   */
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

  /**
   * Fetches a survey with answers populated for export
   * @param {string} surveyId - The survey ID to fetch
   * @param {string} orgUserId - The organization's user ID
   * @returns {Promise<object>}
   */
  async function getSurveysForExport(surveyId, orgUserId) {
    const survey = await Survey.findOne({ _id: surveyId, user_id: orgUserId }).populate('questions.answers');
    return survey;
  }

  /**
   * Gets billing details from the researcher profile
   * @param {string} userId - The string User.id matched in ResearcherProfile.userId
   * @returns {Promise<object>}
   */
  async function getOrgBillingDetails(userId) {
    const profile = await ResearcherProfile.findOne({ userId });
    return profile;
  }

  return {
    getOrgWideStats,
    getAggregatedDemographics,
    getSurveysForExport,
    getOrgBillingDetails
  };
}

module.exports = { createCorporateDashboardRepo };
