'use strict';

const { createAccountTypeService, RESEARCHER_TIER_MAP } = require('../../src/kyc/account-type.service');
const { accountTypeBody } = require('../../src/kyc/account-type.schema');

describe('Account Type Update KYC', () => {
  describe('Schema Validation', () => {
    it('rejects invalid userType', () => {
      const payload = { userType: 'admin' };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(false);
    });

    it('validates student researcher payload successfully', () => {
      const payload = {
        userType: 'researcher',
        researcherType: 'student',
        academicStatus: 'Undergraduate',
        institution: 'Obafemi Awolowo University',
        studentEmail: 'student@oauife.edu.ng',
        faculty: 'Technology',
        department: 'Computer Science',
        level: '400',
        matriculationNumber: 'CSC/2020/001',
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('validates professional researcher payload successfully', () => {
      const payload = {
        userType: 'researcher',
        researcherType: 'professional',
        title: 'Dr',
        profession: 'Data Scientist',
        areaOfSpecialisation: 'Machine Learning',
        employer: 'AI Labs',
        workEmail: 'pro@ailabs.org',
        stateOfPractice: 'Lagos',
        researchPurpose: 'Academic and Market Research',
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('validates corporate researcher payload successfully', () => {
      const payload = {
        userType: 'researcher',
        researcherType: 'corporate',
        orgName: 'Omega Digital Technologies',
        orgType: 'Software Agency',
        industry: 'FinTech',
        orgEmail: 'contact@omegadigital.com',
        orgPhone: '+2348012345678',
        contactName: 'Peter Parker',
        contactRole: 'Lead Engineer',
        stateOfOperation: 'Lagos',
        billingAddress: '12 Admiralty Way, Lekki',
        researchPurpose: 'User Experience Survey',
        expectedMonthlySurveys: '15',
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('validates respondent payload successfully', () => {
      const payload = {
        userType: 'respondent',
        gender: 'male',
        stateOfOrigin: 'Osun',
        stateOfResidence: 'Lagos',
        lgaOfResidence: 'Ikeja',
        isStudent: false,
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('validates student respondent payload with required academic fields', () => {
      const payload = {
        userType: 'respondent',
        gender: 'female',
        stateOfResidence: 'Oyo',
        lgaOfResidence: 'Ibadan North',
        isStudent: true,
        academicLevel: 'Undergraduate',
        levelOfStudy: '300',
        institution: 'University of Ibadan',
        faculty: 'Science',
        department: 'Mathematics',
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('fails student respondent when academic fields are missing', () => {
      const payload = {
        userType: 'respondent',
        gender: 'female',
        stateOfResidence: 'Oyo',
        lgaOfResidence: 'Ibadan North',
        isStudent: true,
      };
      const res = accountTypeBody.safeParse(payload);
      expect(res.success).toBe(false);
    });
  });

  describe('Service Layer', () => {
    let UserMock;
    let ResearcherProfileMock;
    let RespondentProfileMock;
    let service;

    beforeEach(() => {
      UserMock = {
        findOne: jest.fn(),
      };
      ResearcherProfileMock = {
        findOneAndUpdate: jest.fn(),
      };
      RespondentProfileMock = {
        findOneAndUpdate: jest.fn(),
      };
      service = createAccountTypeService({
        User: UserMock,
        ResearcherProfile: ResearcherProfileMock,
        RespondentProfile: RespondentProfileMock,
      });
    });

    it('throws 404 if user does not exist', async () => {
      UserMock.findOne.mockResolvedValue(null);
      await expect(service.updateAccountType('non-existent-user', { userType: 'respondent' }))
        .rejects.toThrow('User not found');
    });

    it('updates student researcher and assigns Standard tier', async () => {
      const fakeUser = {
        id: 'user-123',
        userType: null,
        save: jest.fn().mockResolvedValue(true),
      };
      UserMock.findOne.mockResolvedValue(fakeUser);

      const fakeProfile = {
        userId: 'user-123',
        researcherType: 'student',
        tier: 'Standard',
        toObject: () => ({ userId: 'user-123', researcherType: 'student', tier: 'Standard' }),
      };
      ResearcherProfileMock.findOneAndUpdate.mockResolvedValue(fakeProfile);

      const payload = {
        userType: 'researcher',
        researcherType: 'student',
        academicStatus: 'Undergraduate',
        institution: 'OAU',
        studentEmail: 'p@oau.edu.ng',
        faculty: 'Tech',
        department: 'CS',
        level: '300',
      };

      const result = await service.updateAccountType('user-123', payload);

      expect(fakeUser.userType).toBe('researcher');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(ResearcherProfileMock.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-123' },
        expect.objectContaining({
          userId: 'user-123',
          tier: 'Standard',
          researcherType: 'student',
          institution: 'OAU',
        }),
        expect.objectContaining({ upsert: true, new: true })
      );
      expect(result.userType).toBe('researcher');
      expect(result.profile.tier).toBe('Standard');
    });

    it('updates professional researcher and assigns Premium tier', async () => {
      const fakeUser = {
        id: 'user-456',
        userType: null,
        save: jest.fn().mockResolvedValue(true),
      };
      UserMock.findOne.mockResolvedValue(fakeUser);

      const fakeProfile = {
        userId: 'user-456',
        researcherType: 'professional',
        tier: 'Premium',
        toObject: () => ({ userId: 'user-456', researcherType: 'professional', tier: 'Premium' }),
      };
      ResearcherProfileMock.findOneAndUpdate.mockResolvedValue(fakeProfile);

      const payload = {
        userType: 'researcher',
        researcherType: 'professional',
        title: 'Engr',
        profession: 'Software Engineer',
        areaOfSpecialisation: 'Backend',
        employer: 'Tech Corp',
        workEmail: 'engr@tech.com',
        stateOfPractice: 'Lagos',
        researchPurpose: 'Performance survey',
      };

      const result = await service.updateAccountType('user-456', payload);

      expect(fakeUser.userType).toBe('researcher');
      expect(result.profile.tier).toBe('Premium');
    });

    it('updates corporate researcher and assigns Institutional tier', async () => {
      const fakeUser = {
        id: 'user-789',
        userType: null,
        save: jest.fn().mockResolvedValue(true),
      };
      UserMock.findOne.mockResolvedValue(fakeUser);

      const fakeProfile = {
        userId: 'user-789',
        researcherType: 'corporate',
        tier: 'Institutional',
        toObject: () => ({ userId: 'user-789', researcherType: 'corporate', tier: 'Institutional' }),
      };
      ResearcherProfileMock.findOneAndUpdate.mockResolvedValue(fakeProfile);

      const payload = {
        userType: 'researcher',
        researcherType: 'corporate',
        orgName: 'Omega Corp',
        orgType: 'Enterprise',
        industry: 'Software',
        orgEmail: 'corp@omega.com',
        orgPhone: '+2348000000000',
        contactName: 'Jane Doe',
        contactRole: 'Director',
        stateOfOperation: 'Abuja',
        billingAddress: 'Plot 100 CBD',
        researchPurpose: 'Enterprise Research',
        expectedMonthlySurveys: '20',
      };

      const result = await service.updateAccountType('user-789', payload);

      expect(fakeUser.userType).toBe('researcher');
      expect(result.profile.tier).toBe('Institutional');
    });

    it('updates respondent profile successfully', async () => {
      const fakeUser = {
        id: 'user-999',
        phone: '+2348099999999',
        userType: null,
        save: jest.fn().mockResolvedValue(true),
      };
      UserMock.findOne.mockResolvedValue(fakeUser);

      const fakeProfile = {
        userId: 'user-999',
        gender: 'female',
        toObject: () => ({ userId: 'user-999', gender: 'female' }),
      };
      RespondentProfileMock.findOneAndUpdate.mockResolvedValue(fakeProfile);

      const payload = {
        userType: 'respondent',
        gender: 'female',
        stateOfResidence: 'Lagos',
        lgaOfResidence: 'Surulere',
        isStudent: false,
      };

      const result = await service.updateAccountType('user-999', payload);

      expect(fakeUser.userType).toBe('respondent');
      expect(RespondentProfileMock.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-999' },
        expect.objectContaining({
          userId: 'user-999',
          phoneNumber: '+2348099999999',
          gender: 'female',
          stateOfResidence: 'Lagos',
        }),
        expect.objectContaining({ upsert: true, new: true })
      );
      expect(result.userType).toBe('respondent');
    });
  });
});
