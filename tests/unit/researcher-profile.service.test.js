'use strict';

const { createResearcherProfileService } = require('../../src/kyc/researcher-profile.service');
const { researcherProfileBody } = require('../../src/kyc/researcher-profile.schema');

describe('Researcher Profile KYC', () => {
  describe('Schema Validation', () => {
    it('Unknown researcherType rejected by Zod', () => {
      const payload = { researcherType: 'unknown', institution: 'XYZ' };
      const result = researcherProfileBody.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('Student payload validated correctly', () => {
      const payload = {
        researcherType: 'student',
        institution: 'XYZ University',
        faculty: 'Science',
        department: 'CS',
        matricNumber: '12345',
      };
      const result = researcherProfileBody.safeParse(payload);
      expect(result.success).toBe(true);
    });
    
    it('Corporate payload validated correctly', () => {
      const payload = {
        researcherType: 'corporate',
        companyName: 'Omega Digital',
        rcNumber: 'RC123456',
        industry: 'Tech',
      };
      const result = researcherProfileBody.safeParse(payload);
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
      service = createResearcherProfileService({ repo: repoMock });
    });

    it('Student payload creates ResearcherProfile correctly', async () => {
      repoMock.findByUserId.mockResolvedValue(null);
      const payload = {
        researcherType: 'student',
        institution: 'XYZ',
        faculty: 'Sci',
        department: 'CS',
        matricNumber: '123',
      };
      repoMock.create.mockResolvedValue({ id: 'doc123', ...payload });

      const result = await service.submit('user_123', payload);

      expect(repoMock.findByUserId).toHaveBeenCalledWith('user_123');
      expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user_123', ...payload }));
      expect(result.id).toBe('doc123');
    });

    it('Resubmit with different type returns AppError(409)', async () => {
      // Mock that the user already submitted a profile
      repoMock.findByUserId.mockResolvedValue({ id: 'existing_profile', researcherType: 'student' });
      
      const payload = {
        researcherType: 'professional',
        jobTitle: 'Dev',
        organization: 'Corp',
        industry: 'IT',
      };

      await expect(service.submit('user_123', payload)).rejects.toMatchObject({
        status: 409,
        message: 'Researcher profile already submitted and cannot be changed',
      });
      expect(repoMock.create).not.toHaveBeenCalled();
    });
  });
});
