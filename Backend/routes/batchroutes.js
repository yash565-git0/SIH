const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const BatchController = require("../controller/batchcontroller");
const {authenticateAppToken}= require('../middleware/authMiddleware');
const batchValidation = [
  body("collection_event_ids").isArray().withMessage("Collection events must be an array"), 
  body("species_id").notEmpty().withMessage("Species ID is required"),
  body("current_location").optional().isString().withMessage("Current location must be a string"), 
  body("status").optional().isIn(["pending", "processing", "completed"]).withMessage("Invalid status"),
];

router.post("/:batchId/processing-steps", 
  authenticateAppToken,
  [
    param("batchId").isMongoId().withMessage("Invalid batch ID"),
    body("step_type").notEmpty().withMessage("Step type is required"),
    body("conditions").optional().isString(),
    body("notes").optional().isString(),
    body("facility_id").optional().isMongoId()
  ],
  BatchController.addProcessingStep
);
router.post("/",authenticateAppToken, batchValidation, BatchController.createBatch);
router.get("/", BatchController.getAllBatches);
router.get("/:batchId", param("batchId").isMongoId(), BatchController.getBatchDetails);
router.put("/:batchId/status",authenticateAppToken, param("batchId").isMongoId(), BatchController.updateBatchStatus);
router.delete("/:batchId/recall", param("batchId").isMongoId(), BatchController.setRecallFlag);
router.get("/analytics",
  BatchController.getBatchAnalytics
);
router.post("/:batchId/recall",
  authenticateAppToken,
  [
    param("batchId").isMongoId().withMessage("Invalid batch ID"),
    body("recall_reason").notEmpty().withMessage("Recall reason is required"),
    body("recall_severity").isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Invalid recall severity")
  ],
  BatchController.setRecallFlag
);
router.get("/:batchId/provenance", param("batchId").isMongoId(), BatchController.generateProvenanceBundle);

module.exports = router;