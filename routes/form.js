import express from "express";
import { formController } from "../controllers/form.js";
import { responseController } from "../controllers/response.controller.js";

const router = express.Router();

// Forms
router.post("/", formController.createForm);
router.get("/", formController.getForms);
router.get("/:id", formController.getFormById);
router.put("/:id", formController.updateForm);
router.delete("/:id", formController.deleteForm);

// Responses
router.post("/:formId/responses", responseController.submitResponse);
router.get("/:formId/responses", responseController.getResponses);

export const formRouter = router;
