'use strict';

/**
 * @param {{ ExternalForm: object }} dependencies
 * @returns {object}
 */
function createFormIntegrationRepo({ ExternalForm }) {

  /**
   * Persists a new external form record.
   *
   * @param {object} data - Fields matching the ExternalForm schema
   * @returns {Promise<object>} The created document
   */
  async function createExternalForm(data) {
    return ExternalForm.create(data);
  }

  /**
   * Finds a single external form by its internal MongoDB _id,
   * scoped to a specific researcher.
   *
   * @param {string} id - MongoDB _id string
   * @param {string} researcherId
   * @returns {Promise<object|null>}
   */
  async function findById(id, researcherId) {
    return ExternalForm.findOne({ _id: id, researcherId }).lean();
  }

  /**
   * Finds a form by its platform-specific ID and platform key.
   * Used to detect duplicate imports and to look up forms during webhook processing.
   *
   * @param {string} platformFormId
   * @param {string} platform
   * @returns {Promise<object|null>}
   */
  async function findByPlatformFormId(platformFormId, platform) {
    return ExternalForm.findOne({ platformFormId, platform }).lean();
  }

  /**
   * Increments postImportResponseCount by 1 for a given external form.
   * Used when an inbound webhook signals a new response.
   *
   * @param {string} platformFormId
   * @param {string} platform
   * @returns {Promise<object|null>}
   */
  async function incrementResponseCount(platformFormId, platform) {
    return ExternalForm.findOneAndUpdate(
      { platformFormId, platform },
      { $inc: { postImportResponseCount: 1 } },
      { new: true }
    ).lean();
  }

  /**
   * Sets postImportResponseCount to an absolute value.
   * Used during polling (Google Forms) where we get the full total, not a delta.
   *
   * @param {string} platformFormId
   * @param {string} platform
   * @param {number} count
   * @returns {Promise<object|null>}
   */
  async function setResponseCount(platformFormId, platform, count) {
    return ExternalForm.findOneAndUpdate(
      { platformFormId, platform },
      { postImportResponseCount: count, lastPolledAt: new Date() },
      { new: true }
    ).lean();
  }

  /**
   * Lists all external forms for a researcher, with optional platform filter and pagination.
   *
   * @param {string} researcherId
   * @param {{ platform?: string, page: number, limit: number }} opts
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async function listForResearcher(researcherId, { platform, page, limit }) {
    const query = { researcherId };
    if (platform) query.platform = platform;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ExternalForm.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ExternalForm.countDocuments(query),
    ]);
    return { data, total };
  }

  /**
   * Updates the status of an external form (active / paused / error).
   *
   * @param {string} id - MongoDB _id
   * @param {string} researcherId
   * @param {string} status
   * @returns {Promise<object|null>}
   */
  async function updateStatus(id, researcherId, status) {
    return ExternalForm.findOneAndUpdate(
      { _id: id, researcherId },
      { status },
      { new: true }
    ).lean();
  }

  return {
    createExternalForm,
    findById,
    findByPlatformFormId,
    incrementResponseCount,
    setResponseCount,
    listForResearcher,
    updateStatus,
  };
}

module.exports = { createFormIntegrationRepo };
