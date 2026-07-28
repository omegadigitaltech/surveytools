'use strict';

const { createSignupService } = require('../../src/kyc/signup.service');
const User = require('../../model/user');

jest.mock('../../model/user');
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
    User.create.mockResolvedValue({ _id: 'user_123' });
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
});
