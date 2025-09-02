const { validationResult } = require('express-validator');
const QualityTest = require('../models/quality_tests');
const Batch = require('../models/batches');
const QualityLab = require('../models/quality_labs');

class QualityTestController {
  // Submit a new quality test result
  static async submitTestResult(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const {
        batch_id,
        lab_id,
        test_type,
        result,
        result_value,
        units,
        certificate_url,
        notes
      } = req.body;

      // Verify batch exists
      const batch = await Batch.findById(batch_id);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Verify lab exists if provided
      if (lab_id) {
        const lab = await QualityLab.findById(lab_id);
        if (!lab) {
          return res.status(404).json({ error: 'Laboratory not found' });
        }
      }

      // Validate test result against thresholds
      const validation = await QualityTestController.validateTestResult(test_type, result, result_value, units);

      const qualityTest = new QualityTest({
        batch_id,
        lab_id,
        test_type,
        result,
        result_value,
        units,
        timestamp: new Date(),
        certificate_url,
        notes,
        validation_status: validation.status,
        validation_notes: validation.notes
      });

      await qualityTest.save();

      // Update batch with test reference
      batch.quality_test_ids.push(qualityTest._id.toString());
      
      // Update batch status based on test results
      if (validation.status === 'FAILED') {
        batch.status = 'QUALITY_FAILED';
        batch.recall_flag = validation.critical;
      } else if (validation.status === 'PASSED' && batch.status === 'QUALITY_CHECK') {
        batch.status = 'PROCESSING';
      }

      await batch.save();

      await qualityTest.populate('batch_id lab_id');

      res.status(201).json({
        message: 'Quality test result submitted successfully',
        test: qualityTest,
        validation,
        batch_status_updated: batch.status
      });

    } catch (error) {
      console.error('Submit test result error:', error);
      res.status(500).json({ error: 'Failed to submit test result', details: error.message });
    }
  }

  // Get quality tests for a batch
  static async getBatchQualityTests(req, res) {
    try {
      const { batchId } = req.params;

      const tests = await QualityTest.find({ batch_id: batchId })
        .populate('lab_id', 'name location accreditation')
        .sort({ timestamp: -1 });

      if (tests.length === 0) {
        return res.status(404).json({ error: 'No quality tests found for this batch' });
      }

      // Aggregate test summary
      const testSummary = {
        total_tests: tests.length,
        passed_tests: tests.filter(t => t.result === 'PASSED').length,
        failed_tests: tests.filter(t => t.result === 'FAILED').length,
        pending_tests: tests.filter(t => t.result === 'PENDING').length,
        test_types: [...new Set(tests.map(t => t.test_type))],
        latest_test: tests[0],
        overall_status: QualityTestController.calculateOverallStatus(tests)
      };

      res.json({
        message: 'Quality tests retrieved successfully',
        tests,
        summary: testSummary
      });

    } catch (error) {
      console.error('Get batch quality tests error:', error);
      res.status(500).json({ error: 'Failed to retrieve quality tests' });
    }
  }

  // Get all quality tests with filtering
  static async getAllQualityTests(req, res) {
    try {
      const {
        lab_id,
        test_type,
        result,
        from_date,
        to_date,
        batch_id,
        page = 1,
        limit = 20
      } = req.query;

      // Build filter
      const filter = {};
      if (lab_id) filter.lab_id = lab_id;
      if (test_type) filter.test_type = test_type;
      if (result) filter.result = result;
      if (batch_id) filter.batch_id = batch_id;

      if (from_date || to_date) {
        filter.timestamp = {};
        if (from_date) filter.timestamp.$gte = new Date(from_date);
        if (to_date) filter.timestamp.$lte = new Date(to_date);
      }

      const skip = (page - 1) * limit;

      const tests = await QualityTest.find(filter)
        .populate('batch_id', 'status species_id qr_code_id')
        .populate('lab_id', 'name location accreditation')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await QualityTest.countDocuments(filter);

      res.json({
        message: 'Quality tests retrieved successfully',
        tests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + tests.length < totalCount
        }
      });

    } catch (error) {
      console.error('Get all quality tests error:', error);
      res.status(500).json({ error: 'Failed to retrieve quality tests' });
    }
  }

  // Update quality test result
  static async updateTestResult(req, res) {
    try {
      const { testId } = req.params;
      const updates = req.body;

      // Don't allow updating certain critical fields
      delete updates.batch_id;
      delete updates.timestamp;

      const test = await QualityTest.findByIdAndUpdate(
        testId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate(['batch_id', 'lab_id']);

      if (!test) {
        return res.status(404).json({ error: 'Quality test not found' });
      }

      // Re-validate if result changed
      if (updates.result || updates.result_value) {
        const validation = await QualityTestController.validateTestResult(
          test.test_type, 
          test.result, 
          test.result_value, 
          test.units
        );
        
        test.validation_status = validation.status;
        test.validation_notes = validation.notes;
        await test.save();
      }

      res.json({
        message: 'Quality test updated successfully',
        test
      });

    } catch (error) {
      console.error('Update test result error:', error);
      res.status(500).json({ error: 'Failed to update test result' });
    }
  }

  // Get quality test analytics
  static async getQualityAnalytics(req, res) {
    try {
      const { timeframe = '30d', lab_id, test_type } = req.query;

      let dateFilter = {};
      const now = new Date();

      switch (timeframe) {
        case '7d':
          dateFilter = { timestamp: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { timestamp: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
          break;
        case '90d':
          dateFilter = { timestamp: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
          break;
      }

      if (lab_id) dateFilter.lab_id = lab_id;
      if (test_type) dateFilter.test_type = test_type;

      // Test result distribution
      const resultDistribution = await QualityTest.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$result', count: { $sum: 1 } } }
      ]);

      // Test type performance
      const testTypeStats = await QualityTest.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: '$test_type',
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$result', 'PASSED'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$result', 'FAILED'] }, 1, 0] } }
        }},
        { $project: {
          test_type: '$_id',
          total: 1,
          passed: 1,
          failed: 1,
          pass_rate: { $multiply: [{ $divide: ['$passed', '$total'] }, 100] }
        }}
      ]);

      // Lab performance
      const labPerformance = await QualityTest.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: '$lab_id',
          total_tests: { $sum: 1 },
          avg_turnaround: { $avg: { $subtract: ['$updatedAt', '$timestamp'] } }
        }},
        { $lookup: { from: 'qualitylabs', localField: '_id', foreignField: '_id', as: 'lab' } },
        { $unwind: '$lab' },
        { $project: {
          lab_name: '$lab.name',
          total_tests: 1,
          avg_turnaround_hours: { $divide: ['$avg_turnaround', 1000 * 60 * 60] }
        }}
      ]);

      // Failed test trends
      const failedTestTrends = await QualityTest.aggregate([
        { $match: { ...dateFilter, result: 'FAILED' } },
        { $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      // Critical quality issues
      const criticalIssues = await QualityTest.find({
        ...dateFilter,
        result: 'FAILED',
        $or: [
          { test_type: 'PESTICIDE_RESIDUE' },
          { test_type: 'HEAVY_METALS' },
          { test_type: 'MICROBIAL_CONTAMINATION' }
        ]
      }).populate('batch_id lab_id').limit(10);

      const analytics = {
        summary: {
          timeframe,
          total_tests: await QualityTest.countDocuments(dateFilter),
          pass_rate: resultDistribution.find(r => r._id === 'PASSED')?.count || 0,
          fail_rate: resultDistribution.find(r => r._id === 'FAILED')?.count || 0
        },
        result_distribution: resultDistribution,
        test_type_performance: testTypeStats,
        laboratory_performance: labPerformance,
        failed_test_trends: failedTestTrends,
        critical_issues: criticalIssues.length,
        recent_critical_issues: criticalIssues
      };

      res.json({
        message: 'Quality analytics retrieved successfully',
        analytics
      });

    } catch (error) {
      console.error('Get quality analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve quality analytics' });
    }
  }

  // Generate FHIR-style test report
  static async generateFHIRReport(req, res) {
    try {
      const { testId } = req.params;

      const test = await QualityTest.findById(testId)
        .populate('batch_id')
        .populate('lab_id');

      if (!test) {
        return res.status(404).json({ error: 'Quality test not found' });
      }

      const fhirReport = {
        resourceType: "DiagnosticReport",
        id: test._id,
        meta: {
          lastUpdated: test.updatedAt || test.createdAt,
          profile: ["http://ayurveda.gov.in/fhir/StructureDefinition/HerbalQualityReport"]
        },
        status: test.result.toLowerCase(),
        category: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "LAB",
            display: "Laboratory"
          }]
        }],
        code: {
          coding: [{
            system: "http://ayurveda.gov.in/fhir/CodeSystem/quality-tests",
            code: test.test_type,
            display: test.test_type.replace('_', ' ')
          }]
        },
        subject: {
          reference: `Batch/${test.batch_id._id}`,
          display: `Batch ${test.batch_id.qr_code_id}`
        },
        effectiveDateTime: test.timestamp,
        performer: [{
          reference: `Organization/${test.lab_id._id}`,
          display: test.lab_id.name
        }],
        result: [{
          reference: `Observation/test-${test._id}`,
          display: `${test.test_type} Result`
        }],
        conclusion: test.result,
        conclusionCode: [{
          coding: [{
            system: "http://ayurveda.gov.in/fhir/CodeSystem/test-results",
            code: test.result,
            display: test.result
          }]
        }]
      };

      // Add observation details
      const observation = {
        resourceType: "Observation",
        id: `test-${test._id}`,
        status: "final",
        category: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory"
          }]
        }],
        code: {
          coding: [{
            system: "http://ayurveda.gov.in/fhir/CodeSystem/quality-tests",
            code: test.test_type
          }]
        },
        subject: {
          reference: `Batch/${test.batch_id._id}`
        },
        effectiveDateTime: test.timestamp,
        valueQuantity: test.result_value && test.units ? {
          value: parseFloat(test.result_value),
          unit: test.units
        } : undefined,
        interpretation: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
            code: test.result === 'PASSED' ? 'N' : 'A',
            display: test.result === 'PASSED' ? 'Normal' : 'Abnormal'
          }]
        }]
      };

      const bundle = {
        resourceType: "Bundle",
        id: `quality-report-${test._id}`,
        type: "document",
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: fhirReport
          },
          {
            resource: observation
          }
        ]
      };

      // Store FHIR bundle URL
      test.fhir_bundle_url = `/api/quality-tests/${testId}/fhir-report`;
      await test.save();

      res.json({
        message: 'FHIR report generated successfully',
        bundle
      });

    } catch (error) {
      console.error('Generate FHIR report error:', error);
      res.status(500).json({ error: 'Failed to generate FHIR report' });
    }
  }

  // Utility method to validate test results
  static async validateTestResult(test_type, result, result_value, units) {
    const validation = {
      status: 'PASSED',
      notes: [],
      critical: false
    };

    // Define quality thresholds for different test types
    const thresholds = {
      'MOISTURE_CONTENT': { max: 12, units: '%', critical: false },
      'PESTICIDE_RESIDUE': { max: 0.1, units: 'ppm', critical: true },
      'HEAVY_METALS': { max: 0.3, units: 'ppm', critical: true },
      'MICROBIAL_CONTAMINATION': { max: 1000, units: 'cfu/g', critical: true },
      'DNA_BARCODING': { min_match: 95, units: '%', critical: false },
      'AFLATOXIN': { max: 15, units: 'ppb', critical: true },
      'ACTIVE_COMPOUNDS': { min: 0.5, units: '%', critical: false }
    };

    const threshold = thresholds[test_type];
    
    if (threshold && result_value && units) {
      const value = parseFloat(result_value);
      
      if (threshold.max && value > threshold.max) {
        validation.status = 'FAILED';
        validation.notes.push(`Value ${value}${units} exceeds maximum limit of ${threshold.max}${threshold.units}`);
        validation.critical = threshold.critical;
      }
      
      if (threshold.min && value < threshold.min) {
        validation.status = 'FAILED';
        validation.notes.push(`Value ${value}${units} below minimum requirement of ${threshold.min}${threshold.units}`);
      }
      
      if (threshold.min_match && value < threshold.min_match) {
        validation.status = 'FAILED';
        validation.notes.push(`Match percentage ${value}% below minimum of ${threshold.min_match}%`);
      }
    }

    // Override with manual result if provided
    if (result === 'FAILED') {
      validation.status = 'FAILED';
      if (test_type === 'PESTICIDE_RESIDUE' || test_type === 'HEAVY_METALS' || test_type === 'MICROBIAL_CONTAMINATION') {
        validation.critical = true;
      }
    }

    return validation;
  }

  // Utility method to calculate overall status
  static calculateOverallStatus(tests) {
    if (tests.length === 0) return 'NO_TESTS';
    
    const hasFailed = tests.some(t => t.result === 'FAILED');
    const hasPending = tests.some(t => t.result === 'PENDING');
    
    if (hasFailed) return 'FAILED';
    if (hasPending) return 'PENDING';
    return 'PASSED';
  }

  // Get test templates for different test types
  static async getTestTemplates(req, res) {
    try {
      const templates = {
        'MOISTURE_CONTENT': {
          description: 'Moisture content analysis',
          acceptable_range: '8-12%',
          method: 'Oven drying method',
          equipment: 'Moisture analyzer',
          duration: '2-4 hours'
        },
        'PESTICIDE_RESIDUE': {
          description: 'Pesticide residue screening',
          acceptable_range: '<0.1 ppm',
          method: 'GC-MS/LC-MS',
          equipment: 'Gas/Liquid Chromatography',
          duration: '24-48 hours'
        },
        'HEAVY_METALS': {
          description: 'Heavy metals analysis',
          acceptable_range: '<0.3 ppm total',
          method: 'ICP-MS',
          equipment: 'Inductively Coupled Plasma',
          duration: '24 hours'
        },
        'MICROBIAL_CONTAMINATION': {
          description: 'Microbial load testing',
          acceptable_range: '<1000 cfu/g',
          method: 'Plate count method',
          equipment: 'Incubator, petri dishes',
          duration: '48-72 hours'
        },
        'DNA_BARCODING': {
          description: 'Species authentication',
          acceptable_range: '>95% match',
          method: 'PCR sequencing',
          equipment: 'PCR machine, sequencer',
          duration: '3-5 days'
        },
        'AFLATOXIN': {
          description: 'Aflatoxin contamination',
          acceptable_range: '<15 ppb',
          method: 'HPLC',
          equipment: 'High Performance Liquid Chromatography',
          duration: '12-24 hours'
        },
        'ACTIVE_COMPOUNDS': {
          description: 'Active compound quantification',
          acceptable_range: '>0.5% (species dependent)',
          method: 'HPLC/UV-Vis',
          equipment: 'HPLC, UV-Vis spectrophotometer',
          duration: '4-8 hours'
        }
      };

      res.json({
        message: 'Test templates retrieved successfully',
        templates
      });

    } catch (error) {
      console.error('Get test templates error:', error);
      res.status(500).json({ error: 'Failed to retrieve test templates' });
    }
  }
}