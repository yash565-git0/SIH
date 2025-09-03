const { validationResult } = require("express-validator");
const ProcessingStep = require("../models/processing_steps");
const Batch = require("../models/batches");

class ProcessingController {
  // Add a new processing step (e.g., drying, grinding)
  static async addProcessingStep(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
      }

      const { batchId, stepType, conditions, timestamp } = req.body;

      // Ensure batch exists
      const batch = await Batch.findById(batchId);
      if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

      const step = new ProcessingStep({ batchId, stepType, conditions, timestamp });
      await step.save();

      // Push step into batch
      batch.processingSteps.push(step._id);
      await batch.save();

      res.status(201).json({ success: true, message: "Processing step recorded", data: step });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all processing steps
  static async getAllProcessingSteps(req, res) {
    try {
      const steps = await ProcessingStep.find().populate("batchId");
      res.json({ success: true, data: steps });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get step by ID
  static async getProcessingStepById(req, res) {
    try {
      const step = await ProcessingStep.findById(req.params.id).populate("batchId");
      if (!step) return res.status(404).json({ success: false, message: "Step not found" });
      res.json({ success: true, data: step });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update step
  static async updateProcessingStep(req, res) {
    try {
      const step = await ProcessingStep.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!step) return res.status(404).json({ success: false, message: "Step not found" });
      res.json({ success: true, message: "Updated successfully", data: step });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Delete step
  static async deleteProcessingStep(req, res) {
    try {
      const step = await ProcessingStep.findByIdAndDelete(req.params.id);
      if (!step) return res.status(404).json({ success: false, message: "Step not found" });

      // Remove from batch
      await Batch.updateOne({ processingSteps: step._id }, { $pull: { processingSteps: step._id } });

      res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ProcessingController;
