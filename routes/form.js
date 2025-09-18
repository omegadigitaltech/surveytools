import express from "express";
import { formController } from "../controllers/form.js";
import { responseController } from "../controllers/response.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Forms
router.post("/",  authMiddleware, formController.createForm);
router.get("/",authMiddleware, formController.getForms);
router.get("/:id",authMiddleware, formController.getFormById);
router.put("/:id",authMiddleware, formController.updateForm);
router.delete("/:id", authMiddleware,formController.deleteForm);

// Responses
router.post("/:formId/responses", authMiddleware, responseController.submitResponse);
router.get("/:formId/responses", authMiddleware, responseController.getResponses);

export const formRouter = router;
