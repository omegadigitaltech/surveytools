'use strict';

const { createSignupService } = require('../../src/kyc/signup.service');
const User = require('../../model/user');
const referralService = require('../../src/gamification/referral.service');
const { UserGamification } = require('../../model/gamification');

jest.mock('../../model/user');
jest.mock('../../model/gamification');
jest.mock('../../src/gamification/referral.service', () => ({
  validateReferralCode: jest.fn(),
  applyReferralRewards: jest.fn(),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('createSignupService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createSignupService();
  });

  const getValidPayload = () => {
    // 20 years old
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 20);
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      userType: 'researcher',
      dateOfBirth: dateOfBirth.toISOString(),
    };
  };

  it('valid payload creates User, returns 201 with userId', async () => {
    User.create.mockResolvedValue({ id: 'user_123', _id: 'user_123' });
    const payload = getValidPayload();

    const result = await service.register(payload);

    expect(result).toEqual({ userId: 'user_123' });
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullname: 'John Doe',
        email: 'john@example.com',
        userType: 'researcher',
      })
    );
  });

  it('Age < 18 returns AppError(400, "Must be 18 or older")', async () => {
    const payload = getValidPayload();
    // 17 years old
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 17);
    payload.dateOfBirth = dateOfBirth.toISOString();

    await expect(service.register(payload)).rejects.toMatchObject({
      status: 400,
      message: 'Must be 18 or older to register',
    });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('Duplicate email returns AppError(400)', async () => {
    const duplicateError = new Error('E11000 duplicate key error');
    duplicateError.code = 11000;
    User.create.mockRejectedValue(duplicateError);

    const payload = getValidPayload();

    await expect(service.register(payload)).rejects.toMatchObject({
      status: 400,
      message: 'Email already registered',
    });
  });

  it('valid payload with valid referralCode applies referral rewards', async () => {
    referralService.validateReferralCode.mockResolvedValue({
      userId: 'referrer_id_1',
      referralCode: 'REFCODE123',
    });
    referralService.applyReferralRewards.mockResolvedValue();
    UserGamification.findOne.mockResolvedValue(null);
    UserGamification.create.mockResolvedValue({ userId: 'user_123' });

    User.create.mockResolvedValue({ id: 'user_123', _id: 'user_123' });
    const payload = { ...getValidPayload(), referralCode: 'REFCODE123' };

    const result = await service.register(payload);

    expect(result).toEqual({ userId: 'user_123', referralApplied: true });
    expect(referralService.applyReferralRewards).toHaveBeenCalled();
  });

  it('rejects registration early if referralCode is invalid without creating User', async () => {
    const { AppError } = require('../../lib/app-error');
    referralService.validateReferralCode.mockRejectedValue(
      new AppError(400, 'Referral code "BADCODE123" is not valid. Please double-check the code and try again, or leave it blank to sign up without one.')
    );

    const payload = { ...getValidPayload(), referralCode: 'BADCODE123' };

    await expect(service.register(payload)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('BADCODE123'),
    });
    expect(User.create).not.toHaveBeenCalled();
  });
});
