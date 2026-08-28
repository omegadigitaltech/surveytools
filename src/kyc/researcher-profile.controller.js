'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { researcherProfileBody } = require('./researcher-profile.schema');

const log = createLogger('researcher-profile-controller');

/**
 * @param {{ service: ReturnType<import('./researcher-profile.service').createResearcherProfileService> }} deps
 * @returns {{ submitProfile: (req: import('express').Request, res: import('express').Response) => Promise<void> }}
 */
function createResearcherProfileController({ service }) {
  async function submitProfile(req, res) {
    const result = researcherProfileBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.issues[0].message);
    }

    const userId = req.userId;
    const profile = await service.submit(userId, result.data);

    res.status(201).json({
      status: 'success',
      data: profile,
    });
  }

  return { submitProfile };
}

module.exports = { createResearcherProfileController };
