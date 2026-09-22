'use strict';

const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middleware/auth');
const { createResearcherTierService } = require('../kyc/researcher-tier.service');
const { createResearcherTierMiddleware } = require('../kyc/attach-researcher-tier.middleware');
const { createRespondentProfileRepo } = require('../kyc/respondent-profile.repo');
const { createResearcherProfileRepo } = require('../kyc/researcher-profile.repo');

// Dependencies
const { Survey } = require('../../model/survey');
const DemographicAggregate = require('../../model/demographic-aggregate');
const ResearcherProfile = require('../kyc/researcher-profile.model');
const Invoice = require('../../model/invoice');
const User = require('../../model/user');
const RespondentProfile = require('../kyc/respondent-profile.model');
const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const schemas = require('./corporate-dashboard.schema');
const PDFDocument = require('pdfkit');

// Factories
const { createCorporateDashboardRepo } = require('./corporate-dashboard.repo');
const { createCorporateDashboardService } = require('./corporate-dashboard.service');
const { createCorporateDashboardController } = require('./corporate-dashboard.controller');

// Initialization
const repo = createCorporateDashboardRepo({ Survey, DemographicAggregate, ResearcherProfile });
const service = createCorporateDashboardService({ repo, AppError, schemas, PDFDocument, Invoice, createLogger });
const controller = createCorporateDashboardController({ service, User });
const respondentProfileRepo = createRespondentProfileRepo({ RespondentProfile });
const researcherProfileRepo = createResearcherProfileRepo({ ResearcherProfile });
const tierService = createResearcherTierService({ researcherProfileRepo });
const { attachResearcherTier, requireResearcherTier } = createResearcherTierMiddleware({ tierService });

// Routes
router.use(authMiddleware);
router.use(attachResearcherTier);
router.use(requireResearcherTier(['Institutional']));

router.get('/corporate/overview', controller.getOverview);
router.get('/corporate/analytics', controller.getAnalytics);
router.get('/corporate/invoice/:id', controller.getInvoice);
router.get('/corporate/export', controller.getExport);

module.exports = router;
