const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const ConsumerController = require("../controller/consumercontroller");

// Validate QR scan
const qrScanValidation = [
  body("qrCodeValue").notEmpty().withMessage("QR Code value is required"),
  body("consumerId").notEmpty().withMessage("Consumer ID is required"),
];

// Validate provenance query
const provenanceValidation = [
  param("batchId").isMongoId().withMessage("Invalid batch ID"),
];

router.post("/scan", qrScanValidation, ConsumerController.scanQRCode);
router.get("/provenance/:batchId", provenanceValidation, ConsumerController.getProvenanceByBatch);

module.exports = router;