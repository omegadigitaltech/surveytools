'use strict';

const crypto = require('crypto');

// Use a 32-byte key from environment or fallback to a hardcoded one for development only.
// In production, KYC_ENCRYPTION_KEY must be a hex string of 32 bytes (64 chars).
const ENCRYPTION_KEY = process.env.KYC_ENCRYPTION_KEY 
  ? Buffer.from(process.env.KYC_ENCRYPTION_KEY, 'hex')
  : crypto.scryptSync('development-fallback-key', 'salt', 32);

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
    ciphertext: encrypted
  };
}

/**
 * Decrypts an AES-256-GCM payload.
 * @param {{ iv: string, authTag: string, ciphertext: string }} encryptedData
 * @returns {string} The decrypted plaintext string.
 */
function decrypt(encryptedData) {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
