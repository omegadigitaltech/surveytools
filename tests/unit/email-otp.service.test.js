'use strict';

const { createEmailOtpService } = require('../../src/kyc/email-otp.service');
const { createEmailOtpController } = require('../../src/kyc/email-otp.controller');
const { createAcademicEmailOtpController } = require('../../src/kyc/academic-email-otp.controller');
const User = require('../../model/user');

jest.mock('../../model/user');

describe('Email OTP & Academic Email OTP Services', () => {
  let mockEmailClient;
  let mockOtpRepo;
  const kycConfig = { otpExpiryMs: 10 * 60 * 1000 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailClient = {
      send: jest.fn().mockResolvedValue(true),
    };
    mockOtpRepo = {
      create: jest.fn().mockResolvedValue(true),
      findActive: jest.fn(),
      markConsumed: jest.fn().mockResolvedValue(true),
      invalidatePrevious: jest.fn().mockResolvedValue(true),
    };
  });

  describe('General Email OTP Service (allowedDomain: null)', () => {
    it('allows OTP request for any valid email (e.g. gmail.com)', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: null,
      });

      await service.requestOtp('john.doe@gmail.com');

      expect(mockOtpRepo.invalidatePrevious).toHaveBeenCalledWith('john.doe@gmail.com');
      expect(mockOtpRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'john.doe@gmail.com',
        code: expect.stringMatching(/^\d{6}$/),
      }));
      expect(mockEmailClient.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'john.doe@gmail.com',
      }));
    });

    it('successfully verifies a valid OTP', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: null,
      });

      mockOtpRepo.findActive.mockResolvedValue({
        _id: 'otp-id-1',
        email: 'john.doe@gmail.com',
        code: '123456',
        consumed: false,
        expiresAt: new Date(Date.now() + 60000),
      });

      const result = await service.verifyOtp('john.doe@gmail.com', '123456');

      expect(result).toBe(true);
      expect(mockOtpRepo.markConsumed).toHaveBeenCalledWith('otp-id-1');
    });

    it('rejects verification if OTP is expired', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: null,
      });

      mockOtpRepo.findActive.mockResolvedValue({
        _id: 'otp-id-1',
        email: 'john.doe@gmail.com',
        code: '123456',
        consumed: false,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.verifyOtp('john.doe@gmail.com', '123456')).rejects.toMatchObject({
        status: 400,
        message: 'OTP has expired',
      });
    });

    it('rejects verification if OTP does not match', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: null,
      });

      mockOtpRepo.findActive.mockResolvedValue({
        _id: 'otp-id-1',
        email: 'john.doe@gmail.com',
        code: '123456',
        consumed: false,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(service.verifyOtp('john.doe@gmail.com', '999999')).rejects.toMatchObject({
        status: 400,
        message: 'Invalid OTP',
      });
    });
  });

  describe('Academic Email OTP Service (allowedDomain: .edu.ng)', () => {
    it('rejects non-academic emails (e.g. gmail.com) when allowedDomain is .edu.ng', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: '.edu.ng',
      });

      await expect(service.requestOtp('student@gmail.com')).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('.edu.ng'),
      });
      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });

    it('accepts institutional .edu.ng email', async () => {
      const service = createEmailOtpService({
        emailClient: mockEmailClient,
        otpRepo: mockOtpRepo,
        kycConfig,
        allowedDomain: '.edu.ng',
      });

      await service.requestOtp('student@unilag.edu.ng');

      expect(mockOtpRepo.invalidatePrevious).toHaveBeenCalledWith('student@unilag.edu.ng');
      expect(mockOtpRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'student@unilag.edu.ng',
        code: expect.stringMatching(/^\d{6}$/),
      }));
      expect(mockEmailClient.send).toHaveBeenCalled();
    });
  });

  describe('Controllers', () => {
    it('General Email OTP Controller updates emailVerified on User', async () => {
      const mockService = {
        requestOtp: jest.fn().mockResolvedValue(),
        verifyOtp: jest.fn().mockResolvedValue(true),
      };
      const controller = createEmailOtpController({ emailOtpService: mockService });

      const req = {
        userId: 'user-123',
        body: { email: 'test@example.com', code: '123456' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.verifyOtp(req, res);

      expect(mockService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'user-123' },
        { emailVerified: true, email: 'test@example.com' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Email OTP verified successfully',
      }));
    });

    it('Academic Email OTP Controller updates academicEmailVerified and emailVerified on User', async () => {
      const mockService = {
        requestOtp: jest.fn().mockResolvedValue(),
        verifyOtp: jest.fn().mockResolvedValue(true),
      };
      const controller = createAcademicEmailOtpController({ emailOtpService: mockService });

      const req = {
        userId: 'student-user-456',
        body: { email: 'student@oau.edu.ng', code: '654321' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.verifyOtp(req, res);

      expect(mockService.verifyOtp).toHaveBeenCalledWith('student@oau.edu.ng', '654321');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'student-user-456' },
        {
          academicEmailVerified: true,
          academicEmail: 'student@oau.edu.ng',
          emailVerified: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Academic OTP verified successfully',
      }));
    });
  });
});
