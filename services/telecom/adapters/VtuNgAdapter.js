const TelecomProvider = require('../interfaces/TelecomProvider');
const axios = require('axios');

class VtuNgAdapter extends TelecomProvider {
    constructor() {
        super();
        // Base URL from vtu.txt
        this.baseUrl = 'https://vtu.ng/wp-json';

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 25000,
        });

        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Authenticate and get JWT token.
     * Caches token until it expires (7 days usually, but we'll check validity).
     */
    async getToken() {
        // 1. Check if we have a valid cached token
        if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.token;
        }

        // 2. Login to get new token
        try {
            const username = process.env.VTU_USERNAME;
            const password = process.env.VTU_PASSWORD;

            if (!username || !password) {
                throw new Error('VTU_USERNAME and VTU_PASSWORD are required in environment variables');
            }

            // Endpoint: POST /jwt-auth/v1/token
            const response = await this.client.post('/jwt-auth/v1/token', {
                username,
                password
            });

            const data = response.data;
            if (data && data.token) {
                this.token = data.token;
                // Token valid for ~7 days per doc. Set expiry to 6 days to be safe.
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 6);
                this.tokenExpiry = expiry;

                return this.token;
            } else {
                throw new Error('Failed to retrieve token from VTU.ng login response');
            }
        } catch (error) {
            console.error('VtuNgAdapter: Authentication failed:', error?.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get authenticated headers
     */
    async getAuthHeaders() {
        const token = await this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getDataPlans(network) {
        try {
            // Endpoint: GET /api/v2/variations/data
            // Query Param: service_id (mtn, airtel, glo, 9mobile)
            // Doc says "Authentication: Not required" for variations, but some setups might still like it.
            // We will try without auth first as per doc.

            const serviceId = network.toLowerCase();

            const response = await this.client.get('/api/v2/variations/data', {
                params: { service_id: serviceId }
            });

            const data = response.data;

            if (!data || !data.data) {
                console.warn(`VtuNgAdapter: Failed to fetch plans for ${network}:`, data);
                return [];
            }

            // Transform generic plans to our format
            return data.data
                .filter(plan => plan.availability === 'Available')
                .map(plan => ({
                    planId: plan.variation_id,
                    name: plan.data_plan,
                    size: plan.data_plan,
                    price: Number(plan.price),
                    network: this.normalizeNetwork(network),
                    availability: plan.availability
                }));

        } catch (error) {
            console.error(`VtuNgAdapter: Error fetching plans for ${network}:`, error?.response?.data || error.message);
            return [];
        }
    }

    resolveNetwork(network) {
        const map = {
            '1': 'mtn',
            '2': 'airtel',
            '3': '9mobile',
            '4': 'glo'
        };
        const key = String(network).toLowerCase();
        return map[key] || key;
    }

    async purchaseAirtime({ phone, amount, network, reference }) {
        try {
            const headers = await this.getAuthHeaders();
            const serviceId = this.resolveNetwork(network);

            const payload = {
                request_id: reference,
                phone: phone,
                service_id: serviceId,
                amount: Number(amount)
            };

            const response = await this.client.post('/api/v2/airtime', payload, { headers });
            const data = response.data;

            const success = data?.code === 'success';

            return {
                success,
                message: data?.message || (success ? 'Airtime successful' : 'Airtime failed'),
                data: data?.data,
                provider: 'vtu.ng',
                reference: reference
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    async purchaseData({ phone, planId, network, reference }) {
        try {
            const headers = await this.getAuthHeaders();
            const serviceId = this.resolveNetwork(network);

            const payload = {
                request_id: reference,
                phone: phone,
                service_id: serviceId,
                variation_id: planId
            };

            const response = await this.client.post('/api/v2/data', payload, { headers });
            const data = response.data;

            const success = data?.code === 'success';

            return {
                success,
                message: data?.message || (success ? 'Data purchase successful' : 'Data purchase failed'),
                data: data?.data,
                provider: 'vtu.ng',
                reference: reference
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    handleError(error) {
        const errorData = error?.response?.data;
        console.error('VtuNgAdapter Error:', errorData || error.message);

        // Check for specific error codes like 'jwt_auth_failed' to trigger re-login next time
        if (errorData?.code === 'jwt_auth_failed' || error?.response?.status === 403) {
            this.token = null;
        }

        return {
            success: false,
            message: errorData?.message || error.message || 'Service Gateway Error',
            provider: 'vtu.ng',
            error: errorData
        };
    }
}

module.exports = VtuNgAdapter;
