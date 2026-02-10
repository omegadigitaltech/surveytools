const { getNetworkCatalog } = require("../services/telecom/catalogCache");
const axios = require('axios');

// telecomAdapter.js
const VTU_BASE_URL = "https://vtu.ng/api";
const FLW_BILL_URL = "https://api.flutterwave.com/v3/";
const FLW_BASE = "https://api.flutterwave.com/v3";

const flwClient = axios.create({
  baseURL: FLW_BASE,
  headers: {
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
/**
 * Disburse telecom service: Airtime or Data Bundle.
 * Auto-selects VTU.ng (if key present) → Flutterwave fallback.
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


  if (type === "airtime") {
    return useFlutterwave({
      phone,
      type,
      amount,
      airtimeType: "nil",
      network,
      reference,
    });
  }

  
  return useFlutterwave({
    phone,
    type,
    itemCode: "",
    reference,
  });
}

/**
 * VTU.ng handler (query params style – common pattern)
 * Many VTU providers use similar GET/POST structure.
 */
async function useVtuNg({
  phone,
  type,
  amount,
  productCode,
  network,
  reference,
}) {
  try {
    const params = new URLSearchParams({
      api_key: process.env.VTU_API_KEY,
      network,
      phone,
      request_id: reference, // some accept request_id
    });

    if (type === "airtime") {
      params.append("amount", amount.toString());
      // Some VTU APIs also support: airtime_type: "VTU" or "Share"
    } else if (type === "data") {
      params.append("product_code", productCode);
      // Some use: data_plan or bundle_code instead
    }

    const url = `${VTU_BASE_URL}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET", // many VTU use GET; change to POST if your provider requires it
      headers: { "Content-Type": "application/json" },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }

    const success =
      response.ok &&
      (data?.status?.toLowerCase?.() === "success" ||
        data?.success ||
        text.toLowerCase().includes("success") ||
        text.toLowerCase().includes("delivered"));

    return {
      success,
      message: success
        ? `${type === "airtime" ? "Airtime" : "Data bundle"} delivered via VTU.ng`
        : `VTU.ng failed: ${data?.message || text.slice(0, 100)}`,
      data,
      provider: "vtu.ng",
    };
  } catch (err) {
    return {
      success: false,
      message: `VTU.ng error: ${err.message}`,
      provider: "vtu.ng",
    };
  }
}

async function getBillItemDetails(billerCode) {
  const billerRes = await flwClient.get(`/billers/${billerCode}/items`);
  return billerRes.data.data[0].item_code;
}
async function validate(itemCode, phoneNumber) {
  const billerRes = await flwClient.get(
    `/bill-items/${itemCode}/validate?customer=${phoneNumber}`,
  );
  const data = billerRes?.data?.data;
  return {
    customerCode: data?.customer,
    biller_code: data?.biller_code,
    product_code: data?.product_code,
  };
}
async function makePayment(billerCode, itemcode, body) {
  const billerRes = await flwClient.post(
    `/billers/${billerCode}/items/${itemcode}/payment`,
    body,
  );
  return {
    status: billerRes.data.status,
    message: billerRes.data.message,
    data: billerRes.data.data,
  };
}
/**
 * Flutterwave handler – uses /v3/bills
 * For data: type = specific bundle name like "MTN 1GB DATA BUNDLE" (you get these from /v3/bill-categories or /v3/billers)
 */
// services/telecom/providers/flutterwave.js
async function useFlutterwave({
  phone,
  type,
  amount,
  itemCode,
  network,
  reference,
}) {
  console.log("useFlutterwave called with:", { phone, type, amount, itemCode, network, reference });

  const AIRTIME_MAP = {
    MTN: { billerCode: "BIL099", names: ["MTN NIGERIA"] },
    AIRTEL: { billerCode: "BIL100", names: ["AIRTEL NIGERIA"] },
    GLO: { billerCode: "BIL102", names: ["GLO NIGERIA"] },
    "9MOBILE": { billerCode: "BIL103", names: ["9MOBILE NIGERIA"] },
  };

  const biller_code =
    type === "airtime" ? AIRTIME_MAP[network.toUpperCase()]?.billerCode : "TEST";
  console.log("Determined biller_code:", biller_code);

  const item_code = await getBillItemDetails(biller_code);
  console.log("Retrieved item_code:", item_code);

  const validationResult = await validate(item_code, phone);
  const { customerCode, biller_code: biller_code_returned, product_code } = validationResult;
  console.log("Validation result:", validationResult);

  const phone_number = phone.startsWith("0") ? "234" + phone.slice(1) : phone;
  console.log("Formatted phone number:", phone_number);

  const res = await makePayment(biller_code_returned, item_code, {
    country: "NG",
    customer_id: phone_number,
    amount,
    reference,
  });
  console.log("Payment request sent, awaiting response...");

  const data = await res.json();
  console.log("Payment response:", data);

  const success = res.ok && data?.status === "success";
  console.log("Payment success:", success);

  return {
    success,
    message: data?.message,
    data,
    provider: "flutterwave",
  };
}


module.exports = { disburseTelecom, useFlutterwave };
