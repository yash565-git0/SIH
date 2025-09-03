const Compliance = require("../models/sustainibility_compliance");
const Batch = require("../models/batches");
const ChainOfCustody = require("../models/chain_of_custody");

class ReportController {
  // Compliance report with linked batches
  static async generateComplianceReport(req, res) {
    try {
      const complianceData = await Compliance.find()
        .populate("batchId")
        .populate("auditorId");

      res.json({
        success: true,
        count: complianceData.length,
        data: complianceData,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Dashboard metrics (high-level KPIs)
  static async getDashboardMetrics(req, res) {
    try {
      const [totalBatches, custodyRecords, complianceRecords] = await Promise.all([
        Batch.countDocuments(),
        ChainOfCustody.countDocuments(),
        Compliance.countDocuments()
      ]);

      res.json({
        success: true,
        data: { totalBatches, custodyRecords, complianceRecords }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ReportController;
