'use strict';

const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../lib/app-error');

const { importFormBody, csvUploadBody, listFormsQuery } = require('./form-integration.schema');
const { ExternalForm } = require('../../model/external-form');
const { OAuthToken } = require('../../model/oauth-token');
const { createFormIntegrationRepo } = require('./form-integration.repo');
const { createFormIntegrationService } = require('./form-integration.service');
const { createFormIntegrationController } = require('./form-integration.controller');

const router = express.Router();

const repo = createFormIntegrationRepo({ ExternalForm });
const service = createFormIntegrationService({ repo, OAuthToken });
const controller = createFormIntegrationController({ service, AppError, OAuthToken });

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.userId,
  message: 'Too many form imports created from this IP/User, please try again after 15 minutes',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Only CSV files are allowed'));
    }
  },
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, result.error.errors[0].message));
  }
  req.body = result.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(new AppError(400, result.error.errors[0].message));
  }
  req.parsedQuery = result.data;
  next();
};

router.use(authMiddleware);

router.get('/oauth/google/start', controller.googleOAuthStart);
router.get('/oauth/google/callback', controller.googleOAuthCallback);
router.post('/import', importLimiter, validateBody(importFormBody), controller.importForm);
router.get('/', validateQuery(listFormsQuery), controller.listForms);
router.post('/csv-upload', upload.single('file'), validateBody(csvUploadBody), controller.uploadCsv);
router.get('/:id', controller.getForm);

module.exports = router;
