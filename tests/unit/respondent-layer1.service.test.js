'use strict';

const { createRespondentLayer1Service } = require('../../src/kyc/respondent-layer1.service');
const { layer1Body } = require('../../src/kyc/respondent-layer1.schema');
const User = require('../../model/user');

jest.mock('../../model/user');

describe('Respondent KYC Layer 1', () => {
  describe('Schema Validation', () => {
    it('Invalid gender rejected by Zod', () => {
      const payload = {
        dateOfBirth: new Date('1990-01-01').toISOString(),
        gender: 'alien',
        stateOfResidence: 'Lagos',
        lgaOfResidence: 'Ikeja',
        isStudent: false,
      };
      const result = layer1Body.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('Valid payload parsed successfully', () => {
      const payload = {
        dateOfBirth: new Date('1990-01-01').toISOString(),
        gender: 'female',
        stateOfResidence: 'Lagos',
        lgaOfResidence: 'Ikeja',
        isStudent: true,
      };
      const result = layer1Body.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Service Layer', () => {
    let repoMock;
    let service;

    beforeEach(() => {
      repoMock = {
        findByUserId: jest.fn(),
        create: jest.fn(),
      };
      service = createRespondentLayer1Service({ respondentProfileRepo: repoMock });
      User.findById.mockReset();
    });

    it('Valid payload creates RespondentProfile', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ phoneVerified: true }),
      });
      repoMock.findByUserId.mockResolvedValue(null);
      const payload = {
        dateOfBirth: new Date('1990-01-01').toISOString(),
        gender: 'male',
      };
      repoMock.create.mockResolvedValue({ id: 'p1', ...payload });

      const result = await service.submit('u1', payload);

      expect(repoMock.create).toHaveBeenCalledWith({ userId: 'u1', ...payload });
      expect(result.id).toBe('p1');
    });

    it('Unverified phone returns AppError(400)', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ phoneVerified: false }),
      });

      await expect(service.submit('u1', { dateOfBirth: '1990-01-01T00:00:00.000Z' })).rejects.toMatchObject({
        status: 400,
        message: 'Phone not verified — complete OTP flow first',
      });
    });

    it('Age < 18 returns AppError(400)', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ phoneVerified: true }),
      });

      // User born today is definitely < 18
      const payload = { dateOfBirth: new Date().toISOString() };

      await expect(service.submit('u1', payload)).rejects.toMatchObject({
        status: 400,
        message: 'Must be 18 or older',
      });
    });

    it('Duplicate submission returns AppError(409)', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ phoneVerified: true }),
      });
      repoMock.findByUserId.mockResolvedValue({ id: 'existing' });

      const payload = { dateOfBirth: new Date('1990-01-01').toISOString() };

      await expect(service.submit('u1', payload)).rejects.toMatchObject({
        status: 409,
        message: 'Layer 1 profile already submitted',
      });
    });
  });
});
