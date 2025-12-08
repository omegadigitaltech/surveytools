/**
 * Pricing Utility Module
 * 
 * Centralized pricing calculation for surveys using a tiered pricing model.
 * 
 * Formula: BR + 15(n) + 250
 * - For first 100 participants: BR = 3000
 * - For every additional 100 participants: BR increases by 1000
 * 
 * Example:
 * - 50 participants: 3000 + (15 × 50) + 250 = 4,000
 * - 100 participants: 3000 + (15 × 100) + 250 = 4,750
 * - 150 participants: 4000 + (15 × 150) + 250 = 6,500
 * - 250 participants: 5000 + (15 × 250) + 250 = 9,000
 */

// Load pricing configuration from environment variables
const INITIAL_BASE_RATE = parseInt(process.env.PRICING_INITIAL_BASE_RATE) || 3000;
const PARTICIPANT_RATE = parseInt(process.env.PRICING_PARTICIPANT_RATE) || 15;
const FIXED_COST = parseInt(process.env.PRICING_FIXED_COST) || 250;
const BASE_RATE_INCREMENT = parseInt(process.env.PRICING_BASE_RATE_INCREMENT) || 1000;
const TIER_SIZE = parseInt(process.env.PRICING_TIER_SIZE) || 100;

/**
 * Calculate the total price for a survey based on the number of participants
 * 
 * @param {number} numParticipants - Total number of participants required
 * @returns {Object} - Object containing calculatedAmount, baseRate, tierIndex, and breakdown
 */
const calculateSurveyPrice = (numParticipants) => {
    if (!numParticipants || numParticipants < 1) {
        throw new Error('Number of participants must be at least 1');
    }

    // Calculate which tier we're in (0-indexed)
    // For 1-100 participants: tierIndex = 0
    // For 101-200 participants: tierIndex = 1
    // For 201-300 participants: tierIndex = 2, etc.
    const tierIndex = Math.floor((numParticipants - 1) / TIER_SIZE);

    // Calculate the base rate for this tier
    const baseRate = INITIAL_BASE_RATE + (tierIndex * BASE_RATE_INCREMENT);

    // Calculate total amount: BR + 15(n) + 250
    const calculatedAmount = baseRate +
        (PARTICIPANT_RATE * numParticipants) +
        FIXED_COST;

    // Calculate points per user based on participant costs and fixed costs
    const pointsPerUser = Math.ceil((PARTICIPANT_RATE * numParticipants + FIXED_COST) / numParticipants);

    return {
        calculatedAmount,
        baseRate,
        tierIndex,
        tier: tierIndex + 1, // Human-readable tier number (1-indexed)
        pointsPerUser,
        breakdown: {
            tier: tierIndex + 1,
            baseRate,
            participantsCost: PARTICIPANT_RATE * numParticipants,
            fixedCost: FIXED_COST,
            totalParticipants: numParticipants,
            pointsPerUser
        }
    };
};

/**
 * Get pricing configuration constants
 * 
 * @returns {Object} - Pricing configuration values
 */
const getPricingConfig = () => {
    return {
        INITIAL_BASE_RATE,
        PARTICIPANT_RATE,
        FIXED_COST,
        BASE_RATE_INCREMENT,
        TIER_SIZE
    };
};

module.exports = {
    calculateSurveyPrice,
    getPricingConfig
};
