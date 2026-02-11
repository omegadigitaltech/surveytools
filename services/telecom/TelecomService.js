const FlutterwaveAdapter = require('./adapters/FlutterwaveAdapter');
const VtuNgAdapter = require('./adapters/VtuNgAdapter');

class TelecomService {
    constructor() {
        this.adapters = {
            FLUTTERWAVE: new FlutterwaveAdapter(),
            VTU: new VtuNgAdapter()
        };
    }

    /**
     * Get the active provider based on environment variable
     * @returns {import('./interfaces/TelecomProvider')}
     */
    getProvider() {
        const providerKey = (process.env.TELECOM_PROVIDER || 'FLUTTERWAVE').toUpperCase();

        if (this.adapters[providerKey]) {
            return this.adapters[providerKey];
        }

        // Default back to Flutterwave if invalid key
        console.warn(`Invalid TELECOM_PROVIDER '${providerKey}', defaulting to FLUTTERWAVE`);
        return this.adapters.FLUTTERWAVE;
    }
}

// Singleton instance
module.exports = new TelecomService();
