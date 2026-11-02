'use strict';

const { AppError } = require('../../lib/app-error');
const { accountTypeBody } = require('./account-type.schema');

/**
 * @param {{ service: ReturnType<import('./account-type.service').createAccountTypeService> }} deps
 * @returns {{ handleUpdateAccountType: (req: import('express').Request, res: import('express').Response) => Promise<void> }}
 */
function createAccountTypeController({ service }) {
  async function handleUpdateAccountType(req, res) {
    const parseResult = accountTypeBody.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(400, parseResult.error.issues[0].message);
    }

    const userId = req.userId;
    const result = await service.updateAccountType(userId, parseResult.data);

    res.status(200).json({
      status: 'success',
      code: 200,
      msg: 'Account type updated successfully',
      data: result,
    });
  }

  return { handleUpdateAccountType };
}

module.exports = { createAccountTypeController };
