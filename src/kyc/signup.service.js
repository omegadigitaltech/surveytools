'use strict';

const bcrypt = require('bcryptjs');
const { AppError } = require('../../lib/app-error');
const User = require('../../model/user');
const RespondentProfile = require('./respondent-profile.model');
const { generateID_users } = require('../../middleware/helper');

/**
 * @returns {{ register: (data: any) => Promise<{ userId: string }> }}
 */
function createSignupService() {
  async function register(data) {
    const dob = new Date(data.dateOfBirth);
    const age = Math.floor((Date.now() - dob) / 3.156e10);
    if (age < 18) throw new AppError(400, 'Must be 18 or older to register');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Retry until a collision-free ID is found, matching the pattern in controllers/auth.js
    let userIdStr = generateID_users(16);
    while (await User.findOne({ id: userIdStr })) {
      userIdStr = generateID_users(16);
    }

    try {
      const user = await User.create({
        id:          userIdStr,
        fullname:    `${data.firstName} ${data.lastName}`,
        email:       data.email,
        password:    hashedPassword,
        userType:    data.userType,
        dateOfBirth: dob,
        // Providing dummy values for legacy required fields to satisfy schema without changing it
        gender:      data.gender || 'unspecified',
        department:  data.department || 'unspecified',
        faculty:     data.faculty || 'unspecified',
        instituition: 'unspecified',
      });

      // For respondents — create the profile seed record immediately so Layer 1
      // fields are available from the moment of registration
      if (data.userType === 'respondent') {
        await RespondentProfile.create({
          userId:           userIdStr,
          phoneNumber:      '', // populated when phone OTP is verified
          dateOfBirth:      dob,
          gender:           data.gender,
          stateOfOrigin:    data.stateOfOrigin,
          stateOfResidence: data.stateOfResidence,
          lgaOfResidence:   data.lgaOfResidence,
          isStudent:        data.isStudent,
          // Student conditional fields — only written if isStudent = true
          ...(data.isStudent ? {
            academicLevel: data.academicLevel,
            levelOfStudy:  data.levelOfStudy,
            institution:   data.institution,
            faculty:       data.faculty,
            department:    data.department,
          } : {}),
        });
      }

      return { userId: user.id };
    } catch (err) {
      if (err.code === 11000) throw new AppError(400, 'Email already registered');
      throw err;
    }
  }

  return { register };
}

module.exports = { createSignupService };
