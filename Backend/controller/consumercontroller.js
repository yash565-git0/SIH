const QRCode = require("../models/qrcodes");
const Batch = require("../models/batches");
const ConsumerScan = require("../models/consumer_scans");

class ConsumerController {
  // Scan QR Code
  static async scanQRCode(req, res) {
    try {
      const { qrCodeValue, consumerId } = req.body;

      const qr = await QRCode.findOne({ value: qrCodeValue }).populate("batchId");
      if (!qr) return res.status(404).json({ success: false, message: "QR Code not found" });

      // Log scan
      const scan = new ConsumerScan({
        qrCode: qr._id,
        consumerId,
        timestamp: new Date()
      });
      await scan.save();

      res.json({ success: true, message: "QR Code scanned", data: { qr, scan } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get provenance for a batch
  static async getProvenanceByBatch(req, res) {
    try {
      const batch = await Batch.findById(req.params.batchId)
        .populate("collectionEvents")
        .populate("qualityTests")
        .populate("processingSteps");

      if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

      res.json({ success: true, data: batch });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ConsumerController;