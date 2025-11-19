const express = require("express");
const { formController } = require("../controllers/form.js");
const { responseController } = require("../controllers/response.controller.js");
const { authMiddleware } = require("../middleware/auth.js");

const router = express.Router();

// Forms
router.post("/",  authMiddleware, formController.createForm);
router.get("/",authMiddleware, formController.getForms);
router.get("/:id", formController.getFormById);
router.put("/:id",authMiddleware, formController.updateForm);
router.delete("/:id", authMiddleware,formController.deleteForm);

// Responses
router.post("/:formId/responses", responseController.submitResponse);
router.get("/:formId/responses", authMiddleware, responseController.getResponses);
router.get("/responses/:id", responseController.getResponseById);

module.exports = router;
