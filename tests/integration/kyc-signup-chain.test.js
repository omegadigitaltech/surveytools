'use strict';

/**
 * Integration tests: KYC signup service
 *
 * These tests run the signup service and researcher-profile service against
 * in-memory mocks — no real DB, no real SMS/email.  They verify the full
 * register → researcher-profile submission chain works end-to-end with the
 * new schema expansions and the verification gates we added.
 *
 * Scope: service-level integration (not HTTP).  HTTP-level tests would require
 * a running server + test DB and can be added as a follow-up.
 */

const { createSignupService } = require('../../src/kyc/signup.service');
const { createResearcherProfileService } = require('../../src/kyc/researcher-profile.service');

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

/** Minimal User model mock */
function makeUserModel({ existingIds = new Set(), existingEmails = new Set() } = {}) {
  const store = new Map();
  return {
    findOne: jest.fn(async (query) => {
      if (query.id) return store.has(query.id) ? store.get(query.id) : null;
      if (query.email) return existingEmails.has(query.email) ? { email: query.email } : null;
      return null;
    }),
    create: jest.fn(async (data) => {
      store.set(data.id, data);
      return data;
    }),
    _store: store,
  };
}

function makeRespondentProfileModel() {
  const profiles = new Map();
  return {
    create: jest.fn(async (data) => { profiles.set(data.userId, data); return data; }),
    findOne: jest.fn(async (query) => profiles.get(query.userId) || null),
    _profiles: profiles,
  };
}

function makeResearcherProfileRepo(existingProfile = null) {
  let stored = existingProfile;
  return {
    findByUserId: jest.fn(async () => stored),
    create: jest.fn(async (data) => { stored = data; return data; }),
    updateTier: jest.fn(async () => stored),
  };
}

// ---------------------------------------------------------------------------
// Signup service — researcher path
// ---------------------------------------------------------------------------

describe('Signup service — researcher registration', () => {
  it('registers a researcher with core fields only and no RespondentProfile', async () => {
    const UserModel = makeUserModel();
    const RespondentProfileModel = makeRespondentProfileModel();

    // Monkey-patch require calls inside signup.service by injecting models
    // Since signup.service directly requires models, we test at the unit boundary
    // and verify the correct data flows through.
    const service = createSignupService();

    // Spy on User.create & RespondentProfile.create via the real modules
    const User = require('../../model/user');
    const RespondentProfile = require('../../src/kyc/respondent-profile.model');

    const userCreateSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const userSaveSpy = jest.spyOn(User, 'create').mockImplementation(async (data) => ({ ...data }));
    const profileCreateSpy = jest.spyOn(RespondentProfile, 'create');

    const result = await service.register({
      firstName: 'Amara',
      lastName: 'Obi',
      email: 'amara@example.com',
      password: 'Str0ngPass!',
      userType: 'researcher',
      dateOfBirth: '1995-05-15T00:00:00.000Z',
    });

    expect(result).toHaveProperty('userId');
    expect(typeof result.userId).toBe('string');
    // RespondentProfile.create should NOT be called for a researcher
    expect(profileCreateSpy).not.toHaveBeenCalled();

    userCreateSpy.mockRestore();
    userSaveSpy.mockRestore();
    profileCreateSpy.mockRestore();
  });

  it('rejects researcher registration if under 18', async () => {
    const service = createSignupService();
    const User = require('../../model/user');
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const under18 = new Date();
    under18.setFullYear(under18.getFullYear() - 17);

    await expect(service.register({
      firstName: 'Young',
      lastName: 'User',
      email: 'young@example.com',
      password: 'Str0ngPass!',
      userType: 'researcher',
      dateOfBirth: under18.toISOString(),
    })).rejects.toMatchObject({ status: 400, message: 'Must be 18 or older to register' });

    jest.spyOn(User, 'findOne').mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Signup service — respondent path
// ---------------------------------------------------------------------------

describe('Signup service — respondent registration', () => {
  it('creates both User and RespondentProfile for a non-student respondent', async () => {
    const User = require('../../model/user');
    const RespondentProfile = require('../../src/kyc/respondent-profile.model');

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockImplementation(async (data) => ({ ...data }));
    const profileCreateSpy = jest.spyOn(RespondentProfile, 'create').mockImplementation(async (d) => d);

    const service = createSignupService();
    const result = await service.register({
      firstName: 'Chidi',
      lastName: 'Nwosu',
      email: 'chidi@example.com',
      password: 'Str0ngPass!',
      userType: 'respondent',
      dateOfBirth: '1998-03-10T00:00:00.000Z',
      gender: 'male',
      stateOfOrigin: 'Anambra',
      stateOfResidence: 'Lagos',
      lgaOfResidence: 'Ikeja',
      isStudent: false,
    });

    expect(result).toHaveProperty('userId');
    expect(profileCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: 'male',
        stateOfOrigin: 'Anambra',
        stateOfResidence: 'Lagos',
        lgaOfResidence: 'Ikeja',
        isStudent: false,
      })
    );
    // Student fields should NOT be in the profile
    const profileData = profileCreateSpy.mock.calls[0][0];
    expect(profileData.academicLevel).toBeUndefined();

    jest.restoreAllMocks();
  });

  it('creates RespondentProfile WITH student fields for a student respondent', async () => {
    const User = require('../../model/user');
    const RespondentProfile = require('../../src/kyc/respondent-profile.model');

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockImplementation(async (data) => ({ ...data }));
    const profileCreateSpy = jest.spyOn(RespondentProfile, 'create').mockImplementation(async (d) => d);

    const service = createSignupService();
    await service.register({
      firstName: 'Ngozi',
      lastName: 'Eze',
      email: 'ngozi@unilag.edu.ng',
      password: 'Str0ngPass!',
      userType: 'respondent',
      dateOfBirth: '2002-01-20T00:00:00.000Z',
      gender: 'female',
      stateOfOrigin: 'Enugu',
      stateOfResidence: 'Lagos',
      lgaOfResidence: 'Surulere',
      isStudent: true,
      academicLevel: 'Undergraduate',
      levelOfStudy: '300L',
      institution: 'University of Lagos',
      faculty: 'Social Sciences',
      department: 'Psychology',
    });

    const profileData = profileCreateSpy.mock.calls[0][0];
    expect(profileData.isStudent).toBe(true);
    expect(profileData.academicLevel).toBe('Undergraduate');
    expect(profileData.levelOfStudy).toBe('300L');
    expect(profileData.institution).toBe('University of Lagos');

    jest.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// Researcher profile service — verification gates
// ---------------------------------------------------------------------------

describe('Researcher profile service — verification gates', () => {
  it('blocks researcher profile submission if phone not verified', async () => {
    const User = require('../../model/user');
    jest.spyOn(User, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue({ phoneVerified: false, emailVerified: false }),
    });

    const repo = makeResearcherProfileRepo(null);
    const service = createResearcherProfileService({ repo });

    await expect(service.submit('user-123', {
      researcherType: 'professional',
      title: 'Dr.',
      profession: 'Lecturer',
      areaOfSpecialisation: 'Public Health',
      employer: 'UI',
      workEmail: 'doc@ui.edu.ng',
      stateOfPractice: 'Oyo',
      researchPurpose: 'Academic',
    })).rejects.toMatchObject({ status: 403, message: /phone/i });

    jest.restoreAllMocks();
  });

  it('blocks student researcher profile submission if email not verified', async () => {
    const User = require('../../model/user');
    jest.spyOn(User, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue({ phoneVerified: true, emailVerified: false }),
    });

    const repo = makeResearcherProfileRepo(null);
    const service = createResearcherProfileService({ repo });

    await expect(service.submit('user-123', {
      researcherType: 'student',
      academicStatus: 'Undergraduate',
      institution: 'UNILAG',
      studentEmail: 'student@unilag.edu.ng',
      faculty: 'Science',
      department: 'Physics',
      level: '300L',
    })).rejects.toMatchObject({ status: 403, message: /email/i });

    jest.restoreAllMocks();
  });

  it('allows professional researcher profile when phone verified (no email gate)', async () => {
    const User = require('../../model/user');
    jest.spyOn(User, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue({ phoneVerified: true, emailVerified: false }),
    });

    const repo = makeResearcherProfileRepo(null);
    const service = createResearcherProfileService({ repo });

    const result = await service.submit('user-123', {
      researcherType: 'professional',
      title: 'Dr.',
      profession: 'Lecturer',
      areaOfSpecialisation: 'Public Health',
      employer: 'UI',
      workEmail: 'doc@ui.edu.ng',
      stateOfPractice: 'Oyo',
      researchPurpose: 'Academic',
    });

    expect(result).toMatchObject({ researcherType: 'professional' });
    jest.restoreAllMocks();
  });

  it('rejects duplicate profile submission with 409', async () => {
    const User = require('../../model/user');
    jest.spyOn(User, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue({ phoneVerified: true, emailVerified: true }),
    });

    // Repo already has a profile for this user
    const repo = makeResearcherProfileRepo({ researcherType: 'professional', userId: 'user-123' });
    const service = createResearcherProfileService({ repo });

    await expect(service.submit('user-123', {
      researcherType: 'professional',
      title: 'Dr.',
    })).rejects.toMatchObject({ status: 409 });

    jest.restoreAllMocks();
  });
});
