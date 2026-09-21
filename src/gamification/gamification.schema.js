'use strict';

const { z } = require('zod');

/**
 * Query schema for the levels ladder endpoint.
 * No required input — but allows optional pagination in the future.
 */
const getLevelsSchema = z.object({}).optional();

/**
 * Query schema for spin history endpoint.
 * Optional pagination params.
 */
const getSpinHistorySchema = z.object({
  page:  z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/**
 * No required body for referral endpoint — user is identified via auth token.
 */
const getReferralsSchema = z.object({}).optional();

/**
 * No required body for achievements endpoint — user is identified via auth token.
 */
const getAchievementsSchema = z.object({}).optional();

module.exports = {
  getLevelsSchema,
  getSpinHistorySchema,
  getReferralsSchema,
  getAchievementsSchema,
};
