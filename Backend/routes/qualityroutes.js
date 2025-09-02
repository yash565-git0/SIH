const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const QualityTestController = require("../controller/qualitytestcontroller");

const qualityValidation = [
  body("batch_id").notEmpty().withMessage("Batch ID is required"),
  body("test_type").notEmpty().withMessage("Test type is required"),
  body("result").notEmpty().withMessage("Result is required"),
  body("timestamp").optional().isISO8601().withMessage("Invalid timestamp"),
];

router.post("/", qualityValidation, QualityTestController.submitTestResult); 
router.get("/", QualityTestController.getAllQualityTests);

router.get("/batch/:batchId", param("batchId").isMongoId(), QualityTestController.getBatchQualityTests);

router.put("/:testId", param("testId").isMongoId(), QualityTestController.updateTestResult);
router.delete("/:testId", param("testId").isMongoId(), QualityTestController.deleteQualityTest);

module.exports = router;