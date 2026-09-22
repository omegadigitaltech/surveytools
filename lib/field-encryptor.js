'use strict';

const crypto = require('crypto');
const kycConfig = require('../config/kyc-config');

const rawKey = kycConfig.kycFieldEncryptionKey;

const ENCRYPTION_KEY = rawKey
  ? Buffer.from(rawKey, 'hex')
  : crypto.scryptSync('test-only-fallback-key', 'salt', 32);

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {{ iv: string, authTag: string, ciphertext: string }}
 */
function encrypt(text) {
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }
  const iv = crypto.randomBytes(12); // Recommended 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted
  };
}

/**
 * Decrypts an AES-256-GCM payload.
 * @param {{ iv: string, authTag: string, encryptedData: string }} encryptedData
 * @returns {string} The decrypted plaintext string.
 */
function decrypt(encryptedDataObj) {
  const iv = Buffer.from(encryptedDataObj.iv, 'hex');
  const authTag = Buffer.from(encryptedDataObj.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedDataObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
