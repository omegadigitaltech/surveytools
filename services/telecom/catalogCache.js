// services/telecom/catalogCache.js

const TelecomCatalog = require("../../model/telecom");

let CACHE = null;

async function loadTelecomCatalog() {
  const docs = await TelecomCatalog.find({});

  console.log(docs, "DOCS");

  CACHE = docs.reduce((acc, n) => {
    acc[n.network] = n;
    return acc;
  }, {});
}

function getNetworkCatalog(network) {
  if (!CACHE) {
    throw new Error("Telecom catalog not loaded");
  }
  return CACHE[network];
}

module.exports = {
  loadTelecomCatalog,
  getNetworkCatalog,
};
