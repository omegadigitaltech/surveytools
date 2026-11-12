'use strict';

const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../lib/field-encryptor');

const EncryptedTokenSchema = new mongoose.Schema(
  {
    iv:            { type: String, required: true },
    authTag:       { type: String, required: true },
    encryptedData: { type: String, required: true },
  },
  { _id: false }
);

const OAuthTokenSchema = new mongoose.Schema(
  {
    researcherId:  { type: String, required: true, index: true },
    platform:      { type: String, required: true, default: 'google_forms' },
    accessToken:   { type: EncryptedTokenSchema, required: true },
    refreshToken:  { type: EncryptedTokenSchema, required: true },
    expiresAt:     { type: Date, required: true },
    scopes:        [{ type: String }],
  },
  { timestamps: true }
);

OAuthTokenSchema.index({ researcherId: 1, platform: 1 }, { unique: true });

/**
 * Stores a Google OAuth token pair encrypted at rest.
 * @param {string} researcherId
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {Date} expiresAt
 * @param {string[]} scopes
 * @returns {Promise<object>}
 */
OAuthTokenSchema.statics.upsertGoogleTokens = async function (
  researcherId,
  accessToken,
  refreshToken,
  expiresAt,
  scopes
) {
  return this.findOneAndUpdate(
    { researcherId, platform: 'google_forms' },
    {
      accessToken:  encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt,
      scopes,
    },
    { upsert: true, new: true }
  );
};

/**
 * Returns decrypted access and refresh tokens for a researcher.
 * @param {string} researcherId
 * @returns {Promise<{ accessToken: string, refreshToken: string, expiresAt: Date } | null>}
 */
OAuthTokenSchema.statics.getGoogleTokens = async function (researcherId) {
  const doc = await this.findOne({ researcherId, platform: 'google_forms' }).lean();
  if (!doc) return null;
  return {
    accessToken:  decrypt(doc.accessToken),
    refreshToken: decrypt(doc.refreshToken),
    expiresAt:    doc.expiresAt,
    scopes:       doc.scopes,
  };
};

const OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

module.exports = { OAuthToken };
