const TelecomService = require("../services/telecom/TelecomService");

// telecomAdapter.js
// These URLs might still be needed for other things, but main logic is in adapters now
const VTU_BASE_URL = "https://vtu.ng/api";
const FLW_BILL_URL = "https://api.flutterwave.com/v3/";
const FLW_BASE = "https://api.flutterwave.com/v3";

/**
 * Disburse telecom service: Airtime or Data Bundle.
 * Uses TelecomService to select the active provider (Flutterwave or VTU.ng).
 *
 * @param {Object} params
 * @param {string} params.phone - Nigerian phone number (e.g. "08031234567")
 * @param {"airtime" | "data"} params.type - "airtime" or "data"
 * @param {number} [params.amount] - Required for airtime (in NGN)
 * @param {string} [params.productCode] - Required for data (e.g. "MTN1GB", "AIRTEL-2GB-V2", "GLO-3GB")
 * @param {string} params.network - "MTN", "AIRTEL", "GLO", "9MOBILE"
 * @param {string} [params.reference] - Optional unique reference
 * @returns {Promise<{ success: boolean, message: string, data?: any, provider: string }>}
 */
async function disburseTelecom({
  phone,
  type,
  amount,
  productCode,
  network,
  reference,
}) {
  const provider = TelecomService.getProvider();

  if (type === "airtime") {
    return provider.purchaseAirtime({
      phone,
      amount,
      network,
      reference
    });
  } else if (type === "data") {
    return provider.purchaseData({
      phone,
      planId: productCode, // mapping productCode to planId
      network,
      reference
    });
  } else {
    return {
      success: false,
      message: `Invalid service type: ${type}`,
      provider: 'none'
    };
  }
}

// Exporting disburseTelecom as main entry point.
// Keeping useFlutterwave/useVtuNg symbols if needed for legacy external usage, 
// but technically they are now encapsulated in the adapters. 
// For backward compatibility or direct usage, we could export them, 
// but it's better to force usage through the adapter.
// However, to avoid breaking any other file checking these specifics, I'll leave them commented out or removed.
// The original file exported { disburseTelecom, useFlutterwave }.
// I will keep useFlutterwave but make it a wrapper around the new adapter to maintain API surface if possible,
// OR just remove it if I'm sure it's not used elsewhere.
// A grep search would confirm. For now I'll just export disburseTelecom as that's what's used in controller.

module.exports = { disburseTelecom };
