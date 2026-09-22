async function creditLayerToSurvey(surveyId, userId, layer, plaintextPayload) {
  const SurveyLayerCredit = require('../../model/survey-layer-credit');
  const DemographicAggregate = require('../../model/demographic-aggregate');

  try {
    await SurveyLayerCredit.create({ surveyId, userId, layer });
  } catch (err) {
    if (err.code === 11000) return; // already credited by the other trigger, safe no-op
    throw err;
  }

  const entries = Object.entries(plaintextPayload).filter(([_, v]) => v != null);
  await Promise.all(entries.map(([field, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return Promise.all(values.map(v =>
      DemographicAggregate.findOneAndUpdate(
        { surveyId, layer, field, value: String(v) },
        { $inc: { count: 1 } },
        { upsert: true }
      )
    ));
  }));
}

module.exports = { creditLayerToSurvey };
