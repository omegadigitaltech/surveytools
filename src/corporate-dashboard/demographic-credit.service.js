'use strict';

/**
 * @param {{ SurveyLayerCredit: object, DemographicAggregate: object, createLogger: function }} dependencies
 * @returns {object}
 */
function createDemographicCreditService({ SurveyLayerCredit, DemographicAggregate, createLogger }) {
  const logger = createLogger('demographic-credit');

  /**
   * Credits a layer's plaintext payload to a survey's demographic aggregate
   * @param {string} surveyId 
   * @param {string} userId 
   * @param {string} layer 
   * @param {object} plaintextPayload 
   */
  async function creditLayerToSurvey(surveyId, userId, layer, plaintextPayload) {
    try {
      await SurveyLayerCredit.create({
        surveyId,
        userId,
        layer
      });
    } catch (err) {
      if (err.code === 11000) {
        logger.info({ surveyId, userId, layer }, 'Credit already processed. Skipping.');
        return; // Already processed
      }
      throw err; // Other DB errors
    }

    const fieldsToIncrement = [];
    for (const [key, value] of Object.entries(plaintextPayload)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== undefined && item !== null && item !== '') {
              fieldsToIncrement.push({
                updateOne: {
                  filter: { surveyId, layer, field: key, value: String(item) },
                  update: { $inc: { count: 1 } },
                  upsert: true
                }
              });
            }
          }
        } else {
          fieldsToIncrement.push({
            updateOne: {
              filter: { surveyId, layer, field: key, value: String(value) },
              update: { $inc: { count: 1 } },
              upsert: true
            }
          });
        }
      }
    }

    if (fieldsToIncrement.length > 0) {
      await DemographicAggregate.bulkWrite(fieldsToIncrement);
    }
  }

  return { creditLayerToSurvey };
}

module.exports = { createDemographicCreditService };
