import { authMiddleware } from "../middleware/auth";

const express = require("express");
const { formController } = require("../controllers/form");
const { responseController } = require("../controllers/response.controller");
const router = express.Router();


router.use(authMiddleware)
// Forms
router.post("/", formController.createForm);
router.get("/", formController.getForms);
router.get("/:id", formController.getFormById);
router.put("/:id", formController.updateForm);
router.delete("/:id", formController.deleteForm);

// Responses
router.post("/:formId/responses", responseController.submitResponse);
router.get("/:formId/responses", responseController.getResponses);

export const  formRouter = router()
