'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { signupBody } = require('./signup.schema');

const log = createLogger('signup-controller');

/**
 * @param {{ signupService: ReturnType<import('./signup.service').createSignupService> }} deps
 * @returns {{ register: (req: import('express').Request, res: import('express').Response) => Promise<void> }}
 */
function createSignupController({ signupService }) {
  async function register(req, res) {
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.issues[0].message);
    }

    const { userId } = await signupService.register(result.data);

    res.status(201).json({
      status: 'success',
      data: { userId }
    });
  }

  return { register };
}

module.exports = { createSignupController };
