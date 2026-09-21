'use strict';

const { z } = require('zod');

// ─── ACHIEVEMENT ──────────────────────────────────────────────────────────────

/**
 * Schema for creating a new Achievement.
 */
const createAchievementSchema = z.object({
  title:        z.string().min(1, 'title is required'),
  description:  z.string().min(1, 'description is required'),
  icon:         z.string().optional().default(''),
  category:     z.enum(['surveys', 'streak', 'referral', 'level', 'points', 'spin']),
  triggerValue: z.number().int().positive('triggerValue must be a positive integer'),
  xpReward:     z.number().int().min(0).optional().default(0),
  pointsReward: z.number().int().min(0).optional().default(0),
  isActive:     z.boolean().optional().default(true),
});

// ─── BONUS EVENT ──────────────────────────────────────────────────────────────

/**
 * Schema for creating a new BonusEvent.
 */
const createBonusEventSchema = z.object({
  title:       z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  multiplier:  z.number().positive('multiplier must be positive').optional().default(2),
  targetType:  z.enum(['all_users', 'specific_level', 'specific_tier']).optional().default('all_users'),
  targetValue: z.string().nullable().optional().default(null),
  startAt:     z.coerce.date(),
  endAt:       z.coerce.date(),
  isActive:    z.boolean().optional().default(true),
}).refine(data => data.endAt > data.startAt, {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

module.exports = {
  createAchievementSchema,
  createBonusEventSchema,
};
