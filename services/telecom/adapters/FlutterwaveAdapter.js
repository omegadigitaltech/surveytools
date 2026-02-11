const TelecomProvider = require('../interfaces/TelecomProvider');
const axios = require('axios');
const TelecomCatalog = require('../../../model/telecom');

class FlutterwaveAdapter extends TelecomProvider {
    constructor() {
        super();
        this.baseUrl = 'https://api.flutterwave.com/v3';
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });

        this.AIRTIME_MAP = {
            MTN: { billerCode: "BIL099", names: ["MTN NIGERIA"] },
            AIRTEL: { billerCode: "BIL100", names: ["AIRTEL NIGERIA"] },
            GLO: { billerCode: "BIL102", names: ["GLO NIGERIA"] },
            "9MOBILE": { billerCode: "BIL103", names: ["9MOBILE NIGERIA"] },
        };
    }

    /**
     * Get available data plans for a network
     * @param {string} network - MTN, GLO, AIRTEL, 9MOBILE
     */
    async getDataPlans(network) {
        try {
            // For Flutterwave, we rely on our synced catalog in the database
            // because fetching live every time might be slow/complex with biller codes
            const catalog = await TelecomCatalog.findOne({ network: network.toUpperCase() });

            if (!catalog || !catalog.flutterwave || !catalog.flutterwave.data || !catalog.flutterwave.data.plans) {
                // Fallback: fetch live if not in DB (or trigger sync?)
                // For now, return empty array or throw error
                console.warn(`No catalog found for ${network} in DB. Plans might be empty.`);
                return [];
            }

            return catalog.flutterwave.data.plans.map(plan => ({
                planId: plan.planId, // Using the ID from our DB
                name: plan.name,
                size: plan.size,
                price: plan.price,
                originalItemCode: plan.itemCode // Internal use for purchase
            }));
        } catch (error) {
            console.error(`FlutterwaveAdapter: Error fetching plans for ${network}:`, error);
            throw error;
        }
    }

    resolveNetwork(network) {
        const map = {
            '1': 'MTN',
            '2': 'AIRTEL',
            '3': '9MOBILE',
            '4': 'GLO'
        };
        const strNetwork = String(network);
        return map[strNetwork] || strNetwork.toUpperCase();
    }

    async purchaseAirtime({ phone, amount, network, reference }) {
        try {
            const netKey = this.resolveNetwork(network);
            const billerCode = this.AIRTIME_MAP[netKey]?.billerCode;

            if (!billerCode) {
                throw new Error(`Invalid network for airtime: ${network} (resolved: ${netKey})`);
            }

            // Get item code (generic for airtime usually)
            const itemCode = await this.getBillItemDetails(billerCode);

            // Validate customer
            const validation = await this.validate(itemCode, phone);

            const phoneNumber = phone.startsWith("0") ? "234" + phone.slice(1) : phone;

            const response = await this.makePayment(validation.biller_code, itemCode, {
                country: "NG",
                customer_id: phoneNumber,
                amount,
                reference,
            });

            const data = response.data;
            const success = response.status === "success" && data?.status === "success";

            return {
                success,
                message: data?.message || (success ? 'Airtime successful' : 'Airtime failed'),
                data,
                provider: 'flutterwave',
                reference: data?.reference || reference
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async purchaseData({ phone, planId, network, reference }) {
        try {
            // 1. Resolve planId to itemCode
            // We need to look up the plan in our DB to find the Flutterwave itemCode
            const catalog = await TelecomCatalog.findOne({
                network: network.toUpperCase()
            });

            const plan = catalog?.flutterwave?.data?.plans.find(p => p.planId === planId);

            if (!plan || !plan.itemCode) {
                throw new Error(`Invalid plan ID ${planId} for network ${network}`);
            }

            const itemCode = plan.itemCode;
            const amount = plan.price;
            const billerCode = catalog.flutterwave.data.billerCode;

            // 2. Validate
            const validation = await this.validate(itemCode, phone);

            const phoneNumber = phone.startsWith("0") ? "234" + phone.slice(1) : phone;

            // 3. Purchase
            const response = await this.makePayment(validation.biller_code, itemCode, {
                country: "NG",
                customer_id: phoneNumber,
                amount,
                reference,
            });

            const data = response.data;
            const success = response.status === "success" && data?.status === "success";

            return {
                success,
                message: data?.message || (success ? 'Data purchase successful' : 'Data purchase failed'),
                data,
                provider: 'flutterwave',
                reference: data?.reference || reference
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    // --- Helper methods specific to Flutterwave ---

    async getBillItemDetails(billerCode) {
        const res = await this.client.get(`/billers/${billerCode}/items`);
        return res.data.data[0].item_code;
    }

    async validate(itemCode, phoneNumber) {
        const res = await this.client.get(
            `/bill-items/${itemCode}/validate?customer=${phoneNumber}`
        );
        const data = res?.data?.data;
        return {
            customerCode: data?.customer,
            biller_code: data?.biller_code,
            product_code: data?.product_code,
        };
    }

    async makePayment(billerCode, itemCode, body) {
        const res = await this.client.post(
            `/billers/${billerCode}/items/${itemCode}/payment`,
            body
        );
        return res.data;
    }

    handleError(error) {
        console.error('FlutterwaveAdapter Error:', error?.response?.data || error.message);
        return {
            success: false,
            message: error?.response?.data?.message || error.message,
            provider: 'flutterwave',
            error: error?.response?.data
        };
    }
}

module.exports = FlutterwaveAdapter;
