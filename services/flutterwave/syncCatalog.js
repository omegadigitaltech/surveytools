// services/flutterwave/syncTelecomCatalog.js

const axios = require("axios");
const TelecomCatalog = require("../../model/telecom");

const FLW_BASE = "https://api.flutterwave.com/v3";






const flwClient = axios.create({
  baseURL: FLW_BASE,
  headers: {
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});


async function syncTelecomCatalog() {
 

  for (const net of networks) {
    try {
      // 1️⃣ Fetch data billers
      const billerRes = await flwClient.get(
        "/billers",
        { params: { country: "NG", category: "data" } }
      );

      const billers = billerRes?.data?.data || [];
      const biller = billers.find(b =>
        b?.name?.toUpperCase().includes(net.network)
      );

      if (!biller) {
        console.warn(`⚠️ No biller found for ${net.network}`);
        continue;
      }

      // 2️⃣ Fetch data plans
      const itemsRes = await flwClient.get(
        `/bill-items/${biller.biller_code}`
      );

      const items = itemsRes?.data?.data || [];

      const plans = items.map(item => ({
        planId: `${net.network}_${item.name.replace(/\s+/g, "_").toUpperCase()}`,
        name: item.name,
        size: item.description || null,
        price: Number(item.amount),
        itemCode: item.item_code,
      }));

      // 3️⃣ Upsert catalog
      await TelecomCatalog.findOneAndUpdate(
        { network: net.network },
        {
          network: net.network,
          flutterwave: {
            airtime: { type: net.airtimeType },
            data: {
              billerCode: biller.biller_code,
              plans,
            },
          },
          updatedAt: new Date(),
        },
        { upsert: true }
      );

      console.log(`✅ ${net.network} catalog synced`);
    } catch (err) {
      console.error(
        `❌ Failed to sync ${net.network} catalog`,
        err?.response?.data || err.message
      );
    }
  }

  console.log("✅ Telecom catalog sync completed");
}

module.exports = {
  syncTelecomCatalog,
};
