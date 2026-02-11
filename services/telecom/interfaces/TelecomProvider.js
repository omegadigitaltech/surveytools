/**
 * Interface/Base class for Telecom Providers
 * All providers must implement these methods.
 */
class TelecomProvider {
    /**
     * Initialize the provider with configuration
     * @param {Object} config 
     */
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Get available data plans for a network
     * @param {string} network - Network name (MTN, GLO, AIRTEL, 9MOBILE)
     * @returns {Promise<Array>} - List of data plans
     */
    async getDataPlans(network) {
        throw new Error('Method getDataPlans() must be implemented');
    }

    /**
     * Purchase airtime
     * @param {Object} params
     * @param {string} params.phone - Phone number
     * @param {number} params.amount - Amount in NGN
     * @param {string} params.network - Network name
     * @param {string} params.reference - Unique transaction reference
     * @returns {Promise<Object>} - Transaction result
     */
    async purchaseAirtime(params) {
        throw new Error('Method purchaseAirtime() must be implemented');
    }

    /**
     * Purchase data bundle
     * @param {Object} params
     * @param {string} params.phone - Phone number
     * @param {string} params.planId - Plan ID/Product Code
     * @param {string} params.network - Network name
     * @param {string} params.reference - Unique transaction reference
     * @returns {Promise<Object>} - Transaction result
     */
    async purchaseData(params) {
        throw new Error('Method purchaseData() must be implemented');
    }

    /**
     * Normalize network name to provider format
     * @param {string} network 
     * @returns {string}
     */
    normalizeNetwork(network) {
        return network.toUpperCase();
    }
}

module.exports = TelecomProvider;
