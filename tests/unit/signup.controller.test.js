'use strict';

const { createSignupController } = require('../../src/kyc/signup.controller');

describe('Signup Controller — referralCode handling', () => {
  let mockSignupService;
  let controller;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockSignupService = {
      register: jest.fn(),
    };
    controller = createSignupController({ signupService: mockSignupService });

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  const validPayload = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    password: 'password123',
    userType: 'researcher',
    dateOfBirth: '1995-01-01T00:00:00.000Z',
  };

  it('accepts signup without referralCode and returns referralApplied: false', async () => {
    mockSignupService.register.mockResolvedValue({ userId: 'u123' });
    mockReq = { body: validPayload };

    await controller.register(mockReq, mockRes);

    expect(mockSignupService.register).toHaveBeenCalledWith(
      expect.not.objectContaining({ referralCode: expect.anything() })
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        userId: 'u123',
        referralApplied: false,
      },
    });
  });

  it('accepts signup with valid 10-char referralCode and returns referralApplied: true', async () => {
    mockSignupService.register.mockResolvedValue({ userId: 'u123', referralApplied: true });
    mockReq = {
      body: {
        ...validPayload,
        referralCode: 'ABCD1234EF',
      },
    };

    await controller.register(mockReq, mockRes);

    expect(mockSignupService.register).toHaveBeenCalledWith(
      expect.objectContaining({ referralCode: 'ABCD1234EF' })
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        userId: 'u123',
        referralApplied: true,
      },
    });
  });

  it('rejects signup if referralCode is not 10 characters', async () => {
    mockReq = {
      body: {
        ...validPayload,
        referralCode: 'SHORT',
      },
    };

    await expect(controller.register(mockReq, mockRes)).rejects.toMatchObject({
      status: 400,
      message: 'Referral codes must be exactly 10 characters',
    });
    expect(mockSignupService.register).not.toHaveBeenCalled();
  });
});
