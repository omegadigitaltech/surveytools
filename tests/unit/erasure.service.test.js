'use strict';
const mongoose = require('mongoose');
const { createErasureService } = require('../../src/kyc/erasure.service');
const User = require('../../model/user');
const ResearcherProfile = require('../../src/kyc/researcher-profile.model');
const RespondentProfile = require('../../src/kyc/respondent-profile.model');

jest.mock('../../model/user');
jest.mock('../../src/kyc/researcher-profile.model');
jest.mock('../../src/kyc/respondent-profile.model');

describe('Erasure Service', () => {
  let service;
  
  beforeEach(() => {
    service = createErasureService();
    User.findOneAndUpdate.mockClear();
    ResearcherProfile.deleteOne.mockClear();
    RespondentProfile.deleteOne.mockClear();
  });

  it('Erasure removes PII from all KYC collections', async () => {
    await service.erase('u1');
    expect(ResearcherProfile.deleteOne).toHaveBeenCalledWith({ userId: 'u1' });
    expect(RespondentProfile.deleteOne).toHaveBeenCalledWith({ userId: 'u1' });
  });

  it('Erasure anonymizes User — does NOT hard-delete the document', async () => {
    await service.erase('u1');
    expect(User.findOneAndUpdate).toHaveBeenCalledWith({ id: 'u1' }, {
      firstName: '[deleted]',
      lastName:  '[deleted]',
      email:     'deleted-u1@surveytools.invalid',
      phone:     null,
      kycStatus: 'erased',
    });
  });

  it('Survey responses remain after erasure with userId: null', async () => {
    const updateManyMock = jest.fn().mockResolvedValue({});
    jest.spyOn(mongoose, 'model').mockReturnValue({ updateMany: updateManyMock });
    
    await service.erase('u1');
    expect(mongoose.model).toHaveBeenCalledWith('SurveyResponse');
    expect(updateManyMock).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $set: { userId: null } }
    );
    mongoose.model.mockRestore();
  });
});
