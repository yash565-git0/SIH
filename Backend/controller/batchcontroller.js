const { validationResult } = require('express-validator');
const Batch = require('../models/batches');
const CollectionEvent = require('../models/collectionevents');
const ProcessingStep = require('../models/processing_steps');
const QualityTest = require('../models/quality_tests');
const Product = require('../models/products');
const QrCode = require('../models/qrcodes');
const crypto = require('crypto');

class BatchController {
  // Create a new batch
  static async createBatch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { collection_event_ids, species_id, current_location } = req.body;

      // Generate unique QR code
      const qrCodeId = crypto.randomBytes(16).toString('hex');

      const batch = new Batch({
        collection_event_ids,
        species_id,
        processing_step_ids: [],
        quality_test_ids: [],
        status: 'COLLECTED',
        current_location,
        recall_flag: false,
        qr_code_id: qrCodeId
      });

      await batch.save();

      // Generate QR code entry
      await QrCode.create({
        batch_id: batch._id,
        code: qrCodeId,
        generated_at: new Date(),
        scanned_count: 0
      });

      res.status(201).json({
        message: 'Batch created successfully',
        batch: await batch.populate(['collection_event_ids', 'species_id'])
      });

    } catch (error) {
      console.error('Create batch error:', error);
      res.status(500).json({ error: 'Failed to create batch', details: error.message });
    }
  }

  // Get batch details with full traceability
  static async getBatchDetails(req, res) {
    try {
      const { batchId } = req.params;

      const batch = await Batch.findById(batchId)
        .populate('collection_event_ids')
        .populate('species_id');

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Get processing steps
      const processingSteps = await ProcessingStep.find({ batch_id: batchId })
        .populate(['facility_id', 'operator_id'])
        .sort({ timestamp: 1 });

      // Get quality tests
      const qualityTests = await QualityTest.find({ batch_id: batchId })
        .sort({ timestamp: 1 });

      // Get products from this batch
      const products = await Product.find({ batch_id: batchId });

      // Get QR code info
      const qrCode = await QrCode.findOne({ batch_id: batchId });

      const fullTraceability = {
        batch,
        collection_events: batch.collection_event_ids,
        processing_steps: processingSteps,
        quality_tests: qualityTests,
        products,
        qr_code: qrCode
      };

      res.json({
        message: 'Batch details retrieved successfully',
        traceability: fullTraceability
      });

    } catch (error) {
      console.error('Get batch details error:', error);
      res.status(500).json({ error: 'Failed to retrieve batch details' });
    }
  }

  // Update batch status
  static async updateBatchStatus(req, res) {
    try {
      const { batchId } = req.params;
      const { status, current_location, notes } = req.body;

      const validStatuses = ['COLLECTED', 'IN_TRANSIT', 'PROCESSING', 'QUALITY_CHECK', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'RECALLED'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const batch = await Batch.findByIdAndUpdate(
        batchId,
        { 
          status, 
          current_location: current_location || batch.current_location,
          updatedAt: new Date()
        },
        { new: true }
      ).populate(['collection_event_ids', 'species_id']);

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Log status change as processing step
      if (notes || status) {
        await ProcessingStep.create({
          batch_id: batchId,
          step_type: 'STATUS_CHANGE',
          timestamp: new Date(),
          conditions: `Status changed to: ${status}`,
          notes: notes || `Batch status updated to ${status}`,
          operator_id: req.user._id
        });
      }

      res.json({
        message: 'Batch status updated successfully',
        batch
      });

    } catch (error) {
      console.error('Update batch status error:', error);
      res.status(500).json({ error: 'Failed to update batch status' });
    }
  }

  // Get all batches with filtering options
  static async getAllBatches(req, res) {
    try {
      const { 
        status, 
        species_id, 
        location, 
        recall_flag, 
        page = 1, 
        limit = 20,
        from_date,
        to_date 
      } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (species_id) filter.species_id = species_id;
      if (location) filter.current_location = new RegExp(location, 'i');
      if (recall_flag !== undefined) filter.recall_flag = recall_flag === 'true';
      
      if (from_date || to_date) {
        filter.createdAt = {};
        if (from_date) filter.createdAt.$gte = new Date(from_date);
        if (to_date) filter.createdAt.$lte = new Date(to_date);
      }

      const skip = (page - 1) * limit;

      const batches = await Batch.find(filter)
        .populate('species_id', 'scientific_name common_name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Batch.countDocuments(filter);

      res.json({
        message: 'Batches retrieved successfully',
        batches,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + batches.length < totalCount
        }
      });

    } catch (error) {
      console.error('Get all batches error:', error);
      res.status(500).json({ error: 'Failed to retrieve batches' });
    }
  }

  // Add processing step to batch
  static async addProcessingStep(req, res) {
    try {
      const { batchId } = req.params;
      const { step_type, conditions, notes, facility_id } = req.body;

      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      const processingStep = new ProcessingStep({
        batch_id: batchId,
        step_type,
        timestamp: new Date(),
        conditions,
        notes,
        facility_id,
        operator_id: req.user._id
      });

      await processingStep.save();

      // Update batch with processing step
      batch.processing_step_ids.push(processingStep._id.toString());
      await batch.save();

      await processingStep.populate(['facility_id', 'operator_id']);

      res.status(201).json({
        message: 'Processing step added successfully',
        processing_step: processingStep
      });

    } catch (error) {
      console.error('Add processing step error:', error);
      res.status(500).json({ error: 'Failed to add processing step' });
    }
  }

  // Set recall flag
  static async setRecallFlag(req, res) {
    try {
      const { batchId } = req.params;
      const { recall_reason, recall_severity } = req.body;

      const batch = await Batch.findByIdAndUpdate(
        batchId,
        { 
          recall_flag: true,
          recall_reason,
          recall_severity,
          recall_date: new Date()
        },
        { new: true }
      );

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Also flag all products from this batch
      await Product.updateMany(
        { batch_id: batchId },
        { 
          status: 'RECALLED',
          recall_flag: true,
          recall_reason,
          recall_date: new Date()
        }
      );

      // Log recall as processing step
      await ProcessingStep.create({
        batch_id: batchId,
        step_type: 'RECALL',
        timestamp: new Date(),
        conditions: `Severity: ${recall_severity}`,
        notes: `RECALL INITIATED: ${recall_reason}`,
        operator_id: req.user._id
      });

      res.json({
        message: 'Batch recall flag set successfully',
        batch
      });

    } catch (error) {
      console.error('Set recall flag error:', error);
      res.status(500).json({ error: 'Failed to set recall flag' });
    }
  }

  // Generate provenance bundle (FHIR-style)
  static async generateProvenanceBundle(req, res) {
    try {
      const { batchId } = req.params;

      const batch = await Batch.findById(batchId)
        .populate({
          path: 'collection_event_ids',
          populate: {
            path: 'species_id'
          }
        })
        .populate('species_id');

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Get all related data
      const processingSteps = await ProcessingStep.find({ batch_id: batchId })
        .populate(['facility_id', 'operator_id'])
        .sort({ timestamp: 1 });

      const qualityTests = await QualityTest.find({ batch_id: batchId })
        .sort({ timestamp: 1 });

      const products = await Product.find({ batch_id: batchId });

      // Create FHIR-style provenance bundle
      const provenanceBundle = {
        resourceType: "Bundle",
        id: `batch-provenance-${batchId}`,
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: ["http://ayurveda.gov.in/fhir/StructureDefinition/HerbProvenance"]
        },
        type: "collection",
        timestamp: new Date().toISOString(),
        entry: [
          {
            resourceType: "Batch",
            id: batch._id,
            status: batch.status,
            species: batch.species_id,
            qrCode: batch.qr_code_id,
            recallFlag: batch.recall_flag
          },
          {
            resourceType: "CollectionEvents",
            events: batch.collection_event_ids.map(event => ({
              id: event._id,
              timestamp: event.timestamp,
              location: {
                latitude: event.latitude,
                longitude: event.longitude
              },
              collector: event.collector_id,
              cooperative: event.cooperative_id,
              harvestMethod: event.harvest_method,
              qualityMetrics: event.initial_quality_metrics,
              environmentalConditions: event.environmental_conditions
            }))
          },
          {
            resourceType: "ProcessingSteps",
            steps: processingSteps.map(step => ({
              id: step._id,
              type: step.step_type,
              timestamp: step.timestamp,
              facility: step.facility_id,
              operator: step.operator_id,
              conditions: step.conditions,
              notes: step.notes
            }))
          },
          {
            resourceType: "QualityTests",
            tests: qualityTests.map(test => ({
              id: test._id,
              type: test.test_type,
              result: test.result,
              value: test.result_value,
              units: test.units,
              timestamp: test.timestamp,
              laboratory: test.lab_id,
              certificate: test.certificate_url
            }))
          },
          {
            resourceType: "Products",
            products: products.map(product => ({
              id: product._id,
              name: product.name,
              packagingDate: product.packaging_date,
              expiryDate: product.expiry_date,
              retailLocation: product.retail_location,
              status: product.status
            }))
          }
        ]
      };

      // Store the bundle URL if needed
      if (!batch.provenance_bundle_url) {
        batch.provenance_bundle_url = `/api/batches/${batchId}/provenance`;
        await batch.save();
      }

      res.json({
        message: 'Provenance bundle generated successfully',
        bundle: provenanceBundle
      });

    } catch (error) {
      console.error('Generate provenance bundle error:', error);
      res.status(500).json({ error: 'Failed to generate provenance bundle' });
    }
  }

  // Get batch analytics
  static async getBatchAnalytics(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      
      let dateFilter = {};
      const now = new Date();
      
      switch (timeframe) {
        case '7d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
          break;
        case '90d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
          break;
      }

      // Batch statistics
      const totalBatches = await Batch.countDocuments(dateFilter);
      const statusCounts = await Batch.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const recalledBatches = await Batch.countDocuments({ 
        ...dateFilter, 
        recall_flag: true 
      });

      // Species distribution
      const speciesDistribution = await Batch.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$species_id', count: { $sum: 1 } } },
        { $lookup: { from: 'species', localField: '_id', foreignField: '_id', as: 'species' } },
        { $unwind: '$species' },
        { $project: { species: '$species.common_name', count: 1 } }
      ]);

      // Processing efficiency
      const avgProcessingTime = await ProcessingStep.aggregate([
        { $match: { timestamp: { $gte: dateFilter.createdAt?.$gte || new Date(0) } } },
        { $group: { 
          _id: '$batch_id',
          firstStep: { $min: '$timestamp' },
          lastStep: { $max: '$timestamp' }
        }},
        { $project: {
          processingDays: { 
            $divide: [{ $subtract: ['$lastStep', '$firstStep'] }, 1000 * 60 * 60 * 24] 
          }
        }},
        { $group: {
          _id: null,
          avgDays: { $avg: '$processingDays' }
        }}
      ]);

      const analytics = {
        summary: {
          totalBatches,
          recalledBatches,
          recallRate: totalBatches > 0 ? (recalledBatches / totalBatches * 100).toFixed(2) : 0
        },
        statusDistribution: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        speciesDistribution,
        averageProcessingTime: avgProcessingTime[0]?.avgDays || 0,
        timeframe
      };

      res.json({
        message: 'Batch analytics retrieved successfully',
        analytics
      });

    } catch (error) {
      console.error('Get batch analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve batch analytics' });
    }
  }
}

module.exports = BatchController;