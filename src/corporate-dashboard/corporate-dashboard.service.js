'use strict';

/**
 * @param {{ repo: object, AppError: function, schemas: object, PDFDocument: function, Invoice: object, createLogger: function }} dependencies
 * @returns {object}
 */
function createCorporateDashboardService({ repo, AppError, schemas, PDFDocument, Invoice, createLogger }) {
  const logger = createLogger('corporate-dashboard-service');

  /**
   * Gets organization-wide stats
   * @param {string} orgUserId
   * @returns {Promise<object>}
   */
  async function getOverview(orgUserId) {
    return await repo.getOrgWideStats(orgUserId);
  }

  /**
   * Gets aggregated analytics for a survey
   * @param {string} orgUserId
   * @param {object} query
   * @returns {Promise<object>}
   */
  async function getAnalytics(orgUserId, query) {
    const parsed = schemas.analyticsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new AppError(400, 'Invalid analytics query parameters');
    }
    const { surveyId, filters } = parsed.data;
    
    const surveyCheck = await repo.getSurveysForExport(surveyId, orgUserId);
    if (!surveyCheck) throw new AppError(404, 'Survey not found or access denied');

    return await repo.getAggregatedDemographics(surveyId, filters);
  }

  /**
   * Generates a PDF invoice
   * @param {string} stringUserId
   * @param {string} surveyId
   * @returns {Promise<object>}
   */
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
      logger.info({ invoiceId: invoice._id }, 'Created new invoice');
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

  /**
   * Exports survey data
   * @param {string} orgUserId
   * @param {object} query
   * @returns {Promise<object>}
   */
  async function exportData(orgUserId, query) {
    const parsed = schemas.exportQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new AppError(400, 'Invalid export query parameters');
    }
    const { surveyId, format } = parsed.data;

    const survey = await repo.getSurveysForExport(surveyId, orgUserId);
    if (!survey) throw new AppError(404, 'Survey not found or access denied');

    return { survey, format };
  }

  return {
    getOverview,
    getAnalytics,
    generateInvoice,
    exportData
  };
}

module.exports = { createCorporateDashboardService };
