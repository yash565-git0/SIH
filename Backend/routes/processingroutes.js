const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ProcessingController = require("../controller/processingcontroller");
const {authenticateAppToken}= require('../middleware/authMiddleware');
const processingValidation = [
  body("batchId").notEmpty().withMessage("Batch ID is required"),
  body("stepType").notEmpty().withMessage("Step type is required"),
  body("timestamp").optional().isISO8601().withMessage("Timestamp must be a valid date"),
  body("conditions").optional().isObject().withMessage("Conditions must be an object"),
];

router.post("/",authenticateAppToken, processingValidation, ProcessingController.addProcessingStep);
router.get("/", ProcessingController.getAllProcessingSteps);
router.get("/:id", ProcessingController.getProcessingStepById);
router.put("/:id",authenticateAppToken, ProcessingController.updateProcessingStep);
router.delete("/:id",authenticateAppToken, ProcessingController.deleteProcessingStep);

module.exports = router;