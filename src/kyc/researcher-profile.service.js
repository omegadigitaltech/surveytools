'use strict';

const { AppError } = require('../../lib/app-error');
const User = require('../../model/user');

/**
 * @param {{ repo: ReturnType<import('./researcher-profile.repo').createResearcherProfileRepo> }} deps
 * @returns {{ submit: (userId: string, data: object) => Promise<object> }}
 */
function createResearcherProfileService({ repo }) {
  async function submit(userId, data) {
    // Gate 1: phone must be verified for ALL researcher types
    const user = await User.findOne({ id: userId }).select('phoneVerified emailVerified');
    if (!user) throw new AppError(404, 'User not found');
    if (!user.phoneVerified) {
      throw new AppError(403, 'Phone number must be verified before submitting a researcher profile');
    }

    // Gate 2: student researchers must have verified their .edu.ng email
    if (data.researcherType === 'student' && !user.emailVerified) {
      throw new AppError(403, 'Academic email (.edu.ng) must be verified before submitting a student researcher profile');
    }

    // Gate 3: duplicate guard
    const existing = await repo.findByUserId(userId);
    if (existing) {
      throw new AppError(409, 'Researcher profile already submitted and cannot be changed');
    }

    return repo.create({ userId, ...data });
  }

  return { submit };
}

module.exports = { createResearcherProfileService };
