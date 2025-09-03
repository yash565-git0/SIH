const express = require("express");
const router = express.Router();
const ReportController = require("../controller/reportcontroller");

router.get("/compliance", ReportController.generateComplianceReport);
router.get("/dashboard", ReportController.getDashboardMetrics);

module.exports = router;