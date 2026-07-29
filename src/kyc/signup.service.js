'use strict';

const bcrypt = require('bcryptjs');
const { AppError } = require('../../lib/app-error');
const User = require('../../model/user');
const { generateID_users } = require('../../middleware/helper');

/**
 * @returns {{ register: (data: any) => Promise<{ userId: string }> }}
 */
function createSignupService() {
  async function register(data) {
    const age = Math.floor((Date.now() - new Date(data.dateOfBirth)) / 3.156e10);
    if (age < 18) throw new AppError(400, 'Must be 18 or older to register');
    
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userIdStr = generateID_users(16);
    try {
      const user = await User.create({
        id:          userIdStr,
        fullname:    `${data.firstName} ${data.lastName}`,
        email:       data.email,
        password:    hashedPassword,
        userType:    data.userType,
        dateOfBirth: new Date(data.dateOfBirth),
        // Providing dummy values for legacy required fields to satisfy schema without changing it
        gender:      'unspecified',
        department:  'unspecified',
        faculty:     'unspecified',
        instituition: 'unspecified'
      });
      return { userId: user.id };
    } catch (err) {
      if (err.code === 11000) throw new AppError(400, 'Email already registered');
      throw err;
    }
  }

  return { register };
}

module.exports = { createSignupService };
