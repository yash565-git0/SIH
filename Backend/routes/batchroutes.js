const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const BatchController = require("../controller/batchcontroller");

const batchValidation = [
  body("collectionEvents").isArray().withMessage("Collection events must be an array"),
  body("status").optional().isIn(["pending", "processing", "completed"]).withMessage("Invalid status"),
];

router.post("/", batchValidation, BatchController.createBatch);
router.get("/", BatchController.getAllBatches);
router.get("/:batchId", param("batchId").isMongoId(), BatchController.getBatchDetails);
router.put("/:batchId/status", param("batchId").isMongoId(), BatchController.updateBatchStatus);
router.delete("/:batchId/recall", param("batchId").isMongoId(), BatchController.setRecallFlag);

module.exports = router;