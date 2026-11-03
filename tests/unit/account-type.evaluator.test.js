'use strict';

const { evaluateUserAccountType } = require('../../src/kyc/account-type.evaluator');
const { Survey } = require('../../model/survey');
const ResearcherProfile = require('../../src/kyc/researcher-profile.model');
const RespondentProfile = require('../../src/kyc/respondent-profile.model');
const User = require('../../model/user');

jest.mock('../../model/survey', () => ({
  Survey: {
    exists: jest.fn(),
  },
}));

jest.mock('../../src/kyc/researcher-profile.model', () => ({
  exists: jest.fn(),
}));

jest.mock('../../src/kyc/respondent-profile.model', () => ({
  exists: jest.fn(),
}));

jest.mock('../../model/user', () => ({
  updateOne: jest.fn(),
}));

describe('Account Type Evaluator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects past survey creator with null userType and upgrades to researcher', async () => {
    const fakeUser = {
      _id: 'mongo-id-1',
      id: 'user-1',
      userType: null,
    };
    const fakeUserData = {
      userType: null,
    };

    Survey.exists.mockResolvedValue(true);
    ResearcherProfile.exists.mockResolvedValue(false);

    const result = await evaluateUserAccountType(fakeUser, fakeUserData);

    expect(Survey.exists).toHaveBeenCalledWith({ user_id: 'mongo-id-1' });
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'mongo-id-1' },
      { $set: { userType: 'researcher' } }
    );
    expect(fakeUser.userType).toBe('researcher');
    expect(fakeUserData.userType).toBe('researcher');
    expect(result.userType).toBe('researcher');
    // Since researcher profile does not exist yet, popup is required
    expect(result.requiresAccountTypeUpdate).toBe(true);
  });

  it('flags requiresAccountTypeUpdate for user with null userType and no surveys', async () => {
    const fakeUser = {
      _id: 'mongo-id-2',
      id: 'user-2',
      userType: null,
    };

    Survey.exists.mockResolvedValue(false);

    const result = await evaluateUserAccountType(fakeUser);

    expect(Survey.exists).toHaveBeenCalledWith({ user_id: 'mongo-id-2' });
    expect(User.updateOne).not.toHaveBeenCalled();
    expect(result.requiresAccountTypeUpdate).toBe(true);
    expect(result.userType).toBeNull();
  });

  it('does not require update if researcher already has a ResearcherProfile', async () => {
    const fakeUser = {
      _id: 'mongo-id-3',
      id: 'user-3',
      userType: 'researcher',
    };

    ResearcherProfile.exists.mockResolvedValue(true);

    const result = await evaluateUserAccountType(fakeUser);

    expect(ResearcherProfile.exists).toHaveBeenCalledWith({ userId: 'user-3' });
    expect(result.requiresAccountTypeUpdate).toBe(false);
    expect(result.userType).toBe('researcher');
  });

  it('does not require update if respondent already has a RespondentProfile', async () => {
    const fakeUser = {
      _id: 'mongo-id-4',
      id: 'user-4',
      userType: 'respondent',
    };

    RespondentProfile.exists.mockResolvedValue(true);

    const result = await evaluateUserAccountType(fakeUser);

    expect(RespondentProfile.exists).toHaveBeenCalledWith({ userId: 'user-4' });
    expect(result.requiresAccountTypeUpdate).toBe(false);
    expect(result.userType).toBe('respondent');
  });

  it('requires update if respondent does not have a RespondentProfile yet', async () => {
    const fakeUser = {
      _id: 'mongo-id-5',
      id: 'user-5',
      userType: 'respondent',
    };

    RespondentProfile.exists.mockResolvedValue(false);

    const result = await evaluateUserAccountType(fakeUser);

    expect(result.requiresAccountTypeUpdate).toBe(true);
  });
});
