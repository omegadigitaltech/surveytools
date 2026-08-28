'use strict';

const { AppError } = require('../../lib/app-error');

/**
 * @param {{ repo: ReturnType<import('./researcher-profile.repo').createResearcherProfileRepo> }} deps
 * @returns {{ submit: (userId: string, data: object) => Promise<object> }}
 */
function createResearcherProfileService({ repo }) {
  async function submit(userId, data) {
    const existing = await repo.findByUserId(userId);
    if (existing) {
      throw new AppError(409, 'Researcher profile already submitted and cannot be changed');
    }
    return repo.create({ userId, ...data });
  }

  return { submit };
}

module.exports = { createResearcherProfileService };
