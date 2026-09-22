const repo = require('./corporate-dashboard.repo');
const { AppError } = require('../../lib/app-error');
const { analyticsQuerySchema, exportQuerySchema } = require('./corporate-dashboard.schema');

async function getOverview(orgUserId) {
  return await repo.getOrgWideStats(orgUserId);
}

async function getAnalytics(orgUserId, query) {
  const parsed = analyticsQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw new AppError(400, 'Invalid analytics query parameters');
  }
  const { surveyId, filters } = parsed.data;
  
  const surveyCheck = await repo.getSurveysForExport(surveyId, orgUserId);
  if (!surveyCheck) throw new AppError(404, 'Survey not found or access denied');

  return await repo.getAggregatedDemographics(surveyId, filters);
}

const PDFDocument = require('pdfkit');
const Invoice = require('../../model/invoice');

async function generateInvoice(stringUserId, surveyId) {
  const profile = await repo.getOrgBillingDetails(stringUserId);
  if (!profile) throw new AppError(404, 'Billing details not found');

  let invoice = await Invoice.findOne({ orgUserId: stringUserId, surveyIds: surveyId });
  if (!invoice) {
    invoice = await Invoice.create({
      orgUserId: stringUserId,
      surveyIds: [surveyId],
      rcNumber: profile.rcNumber,
      billingAddress: profile.billingAddress,
      poReference: `PO-${Date.now()}`,
      lineItems: [{ description: 'Corporate Dashboard Access & Analytics', quantity: 1, unitPrice: 500, total: 500 }],
      amount: 500,
    });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve({
        invoice,
        pdfBase64: pdfData.toString('base64')
      });
    });
    doc.on('error', reject);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Date: ${invoice.issuedAt.toISOString().split('T')[0]}`);
    doc.text(`Billed To: ${profile.orgName || profile.contactName || 'Corporate Client'}`);
    doc.text(`RC Number: ${profile.rcNumber || 'N/A'}`);
    doc.text(`Address: ${profile.billingAddress || 'N/A'}`);
    
    doc.moveDown();
    doc.text('Line Items:');
    invoice.lineItems.forEach(item => {
      doc.text(`- ${item.description}: $${item.total}`);
    });
    
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: $${invoice.amount}`, { bold: true });
    
    doc.end();
  });
}

async function exportData(orgUserId, query) {
  const parsed = exportQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw new AppError(400, 'Invalid export query parameters');
  }
  const { surveyId, format } = parsed.data;

  const survey = await repo.getSurveysForExport(surveyId, orgUserId);
  if (!survey) throw new AppError(404, 'Survey not found or access denied');

  return { survey, format };
}

module.exports = {
  getOverview,
  getAnalytics,
  generateInvoice,
  exportData
};
