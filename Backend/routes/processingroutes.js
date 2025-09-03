const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ProcessingController = require("../controller/processingcontroller");
const {authenticateToken}= require('../controller/authcontroller');
const processingValidation = [
  body("batchId").notEmpty().withMessage("Batch ID is required"),
  body("stepType").notEmpty().withMessage("Step type is required"),
  body("timestamp").optional().isISO8601().withMessage("Timestamp must be a valid date"),
  body("conditions").optional().isObject().withMessage("Conditions must be an object"),
];

router.post("/",authenticateToken, processingValidation, ProcessingController.addProcessingStep);
router.get("/", ProcessingController.getAllProcessingSteps);
router.get("/:id", ProcessingController.getProcessingStepById);
router.put("/:id",authenticateToken, ProcessingController.updateProcessingStep);
router.delete("/:id",authenticateToken, ProcessingController.deleteProcessingStep);

module.exports = router;