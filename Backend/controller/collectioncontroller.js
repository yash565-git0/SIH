const { validationResult } = require('express-validator');
const CollectionEvent = require('../models/collectionevents');
const Species = require('../models/species');
const SustainabilityCompliance = require('../models/sustainibility_compliance');
const Collector = require('../models/collectors');
const Cooperative = require('../models/cooperatives');

class CollectionEventController {
  // Create a new collection event (harvest recording)
  static async createCollectionEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const {
        collector_id,
        cooperative_id,
        species_id,
        latitude,
        longitude,
        harvest_method,
        initial_quality_metrics,
        environmental_conditions,
        notes,
        batch_id
      } = req.body;

      // Validate GPS coordinates are within approved zones
      const species = await Species.findById(species_id);
      if (!species) {
        return res.status(400).json({ error: 'Invalid species ID' });
      }

      // Check if coordinates are within approved zones (basic validation)
      if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        return res.status(400).json({ error: 'Invalid GPS coordinates' });
      }

      // Check seasonal restrictions
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      // This would be more complex in reality, checking against species-specific restrictions
      if (species.seasonal_restrictions) {
        // Parse seasonal restrictions and validate (simplified example)
        const restrictions = species.seasonal_restrictions.toLowerCase();
        if (restrictions.includes('winter') && [12, 1, 2].includes(currentMonth)) {
          // Allow winter harvesting
        } else if (restrictions.includes('summer') && [6, 7, 8].includes(currentMonth)) {
          // Allow summer harvesting  
        } else if (restrictions.includes('monsoon') && [9, 10, 11].includes(currentMonth)) {
          // Allow monsoon harvesting
        } else if (!restrictions.includes('year-round')) {
          return res.status(400).json({ 
            error: 'Collection not allowed during current season',
            restrictions: species.seasonal_restrictions 
          });
        }
      }

      const collectionEvent = new CollectionEvent({
        collector_id,
        cooperative_id,
        species_id,
        latitude,
        longitude,
        timestamp: new Date(),
        harvest_method,
        initial_quality_metrics,
        environmental_conditions,
        notes,
        batch_id
      });

      await collectionEvent.save();

      // Create sustainability compliance record
      const compliance = new SustainabilityCompliance({
        compliance_type: 'HARVEST_LOCATION',
        status: 'VERIFIED',
        validated_by: req.user._id,
        validation_timestamp: new Date(),
        notes: `GPS verified: ${latitude}, ${longitude}`,
        collection_event_id: collectionEvent._id
      });

      await compliance.save();
      
      collectionEvent.sustainability_compliance_id = compliance._id.toString();
      await collectionEvent.save();

      // Populate related data
      await collectionEvent.populate(['species_id', 'collector_id', 'cooperative_id']);

      res.status(201).json({
        message: 'Collection event recorded successfully',
        collection_event: collectionEvent,
        compliance
      });

    } catch (error) {
      console.error('Create collection event error:', error);
      res.status(500).json({ error: 'Failed to create collection event', details: error.message });
    }
  }

  // Get collection events with filtering
  static async getCollectionEvents(req, res) {
    try {
      const {
        collector_id,
        cooperative_id,
        species_id,
        from_date,
        to_date,
        harvest_method,
        page = 1,
        limit = 20,
        lat_min,
        lat_max,
        lng_min,
        lng_max
      } = req.query;

      // Build filter
      const filter = {};
      if (collector_id) filter.collector_id = collector_id;
      if (cooperative_id) filter.cooperative_id = cooperative_id;
      if (species_id) filter.species_id = species_id;
      if (harvest_method) filter.harvest_method = harvest_method;

      // Date range filter
      if (from_date || to_date) {
        filter.timestamp = {};
        if (from_date) filter.timestamp.$gte = new Date(from_date);
        if (to_date) filter.timestamp.$lte = new Date(to_date);
      }

      // Geographic bounds filter
      if (lat_min && lat_max && lng_min && lng_max) {
        filter.latitude = { $gte: parseFloat(lat_min), $lte: parseFloat(lat_max) };
        filter.longitude = { $gte: parseFloat(lng_min), $lte: parseFloat(lng_max) };
      }

      const skip = (page - 1) * limit;

      const events = await CollectionEvent.find(filter)
        .populate('species_id', 'scientific_name common_name conservation_status')
        .populate('collector_id', 'name type contact_info')
        .populate('cooperative_id', 'name region contact_info')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await CollectionEvent.countDocuments(filter);

      res.json({
        message: 'Collection events retrieved successfully',
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + events.length < totalCount
        }
      });

    } catch (error) {
      console.error('Get collection events error:', error);
      res.status(500).json({ error: 'Failed to retrieve collection events' });
    }
  }

  // Get collection event details
  static async getCollectionEventDetails(req, res) {
    try {
      const { eventId } = req.params;

      const event = await CollectionEvent.findById(eventId)
        .populate('species_id')
        .populate('collector_id')
        .populate('cooperative_id');

      if (!event) {
        return res.status(404).json({ error: 'Collection event not found' });
      }

      // Get sustainability compliance
      const compliance = await SustainabilityCompliance.findById(event.sustainability_compliance_id);

      res.json({
        message: 'Collection event details retrieved successfully',
        event,
        compliance
      });

    } catch (error) {
      console.error('Get collection event details error:', error);
      res.status(500).json({ error: 'Failed to retrieve collection event details' });
    }
  }

  // Update collection event
  static async updateCollectionEvent(req, res) {
    try {
      const { eventId } = req.params;
      const updates = req.body;

      // Don't allow updating critical fields like GPS coordinates after creation
      const restrictedFields = ['latitude', 'longitude', 'timestamp', 'species_id'];
      restrictedFields.forEach(field => delete updates[field]);

      const event = await CollectionEvent.findByIdAndUpdate(
        eventId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate(['species_id', 'collector_id', 'cooperative_id']);

      if (!event) {
        return res.status(404).json({ error: 'Collection event not found' });
      }

      res.json({
        message: 'Collection event updated successfully',
        event
      });

    } catch (error) {
      console.error('Update collection event error:', error);
      res.status(500).json({ error: 'Failed to update collection event' });
    }
  }

  // Get collection statistics
  static async getCollectionStatistics(req, res) {
    try {
      const { timeframe = '30d', cooperative_id, species_id } = req.query;

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
        case '1y':
          dateFilter = { timestamp: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
          break;
      }

      // Add additional filters
      if (cooperative_id) dateFilter.cooperative_id = cooperative_id;
      if (species_id) dateFilter.species_id = species_id;

      // Total collections
      const totalCollections = await CollectionEvent.countDocuments(dateFilter);

      // Collections by species
      const speciesStats = await CollectionEvent.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$species_id', count: { $sum: 1 } } },
        { $lookup: { from: 'species', localField: '_id', foreignField: '_id', as: 'species' } },
        { $unwind: '$species' },
        { $project: { 
          species_name: '$species.common_name',
          scientific_name: '$species.scientific_name',
          count: 1 
        }},
        { $sort: { count: -1 } }
      ]);

      // Collections by harvest method
      const harvestMethodStats = await CollectionEvent.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$harvest_method', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Collections by cooperative
      const cooperativeStats = await CollectionEvent.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$cooperative_id', count: { $sum: 1 } } },
        { $lookup: { from: 'cooperatives', localField: '_id', foreignField: '_id', as: 'cooperative' } },
        { $unwind: '$cooperative' },
        { $project: { 
          cooperative_name: '$cooperative.name',
          region: '$cooperative.region',
          count: 1 
        }},
        { $sort: { count: -1 } }
      ]);

      // Geographic distribution (simplified - group by region/area)
      const geoStats = await CollectionEvent.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: {
            lat_zone: { $floor: { $multiply: ['$latitude', 10] } }, // Group by 0.1 degree zones
            lng_zone: { $floor: { $multiply: ['$longitude', 10] } }
          },
          count: { $sum: 1 },
          avg_lat: { $avg: '$latitude' },
          avg_lng: { $avg: '$longitude' }
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Monthly trends
      const monthlyTrends = await CollectionEvent.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const statistics = {
        summary: {
          totalCollections,
          timeframe
        },
        speciesDistribution: speciesStats,
        harvestMethods: harvestMethodStats,
        cooperativePerformance: cooperativeStats,
        geographicDistribution: geoStats,
        monthlyTrends: monthlyTrends
      };

      res.json({
        message: 'Collection statistics retrieved successfully',
        statistics
      });

    } catch (error) {
      console.error('Get collection statistics error:', error);
      res.status(500).json({ error: 'Failed to retrieve collection statistics' });
    }
  }

  // Validate harvest against conservation rules
  static async validateHarvestCompliance(req, res) {
    try {
      const { species_id, latitude, longitude, proposed_quantity } = req.body;

      const species = await Species.findById(species_id);
      if (!species) {
        return res.status(400).json({ error: 'Species not found' });
      }

      const validationResults = {
        species_info: {
          name: species.common_name,
          scientific_name: species.scientific_name,
          conservation_status: species.conservation_status
        },
        validations: []
      };

      // Check conservation status
      if (species.conservation_status === 'ENDANGERED' || species.conservation_status === 'CRITICALLY_ENDANGERED') {
        validationResults.validations.push({
          type: 'CONSERVATION_STATUS',
          status: 'RESTRICTED',
          message: 'Species is endangered - special permits required',
          severity: 'HIGH'
        });
      } else {
        validationResults.validations.push({
          type: 'CONSERVATION_STATUS',
          status: 'APPROVED',
          message: 'Species conservation status allows harvesting',
          severity: 'LOW'
        });
      }

      // Check approved zones
      if (species.approved_zones) {
        // This would involve complex geofencing logic
        // For now, simplified validation
        validationResults.validations.push({
          type: 'GEOGRAPHIC_ZONE',
          status: 'APPROVED',
          message: 'Location within approved harvesting zones',
          severity: 'LOW',
          coordinates: { latitude, longitude }
        });
      }

      // Check seasonal restrictions
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (species.seasonal_restrictions) {
        const restrictions = species.seasonal_restrictions.toLowerCase();
        let seasonalStatus = 'APPROVED';
        let seasonalMessage = 'Current season allows harvesting';
        
        if (restrictions.includes('winter') && ![12, 1, 2].includes(currentMonth)) {
          seasonalStatus = 'RESTRICTED';
          seasonalMessage = 'Species can only be harvested in winter months';
        } else if (restrictions.includes('summer') && ![6, 7, 8].includes(currentMonth)) {
          seasonalStatus = 'RESTRICTED';
          seasonalMessage = 'Species can only be harvested in summer months';
        } else if (restrictions.includes('monsoon') && ![9, 10, 11].includes(currentMonth)) {
          seasonalStatus = 'RESTRICTED';
          seasonalMessage = 'Species can only be harvested during monsoon season';
        }
        
        validationResults.validations.push({
          type: 'SEASONAL_RESTRICTION',
          status: seasonalStatus,
          message: seasonalMessage,
          severity: seasonalStatus === 'RESTRICTED' ? 'HIGH' : 'LOW'
        });
      }

      // Check recent harvest density in the area (sustainability check)
      const recentHarvests = await CollectionEvent.countDocuments({
        species_id,
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        latitude: { $gte: latitude - 0.01, $lte: latitude + 0.01 }, // ~1km radius
        longitude: { $gte: longitude - 0.01, $lte: longitude + 0.01 }
      });

      if (recentHarvests > 5) {
        validationResults.validations.push({
          type: 'HARVEST_DENSITY',
          status: 'WARNING',
          message: `High harvest activity in area (${recentHarvests} collections in last 30 days)`,
          severity: 'MEDIUM'
        });
      } else {
        validationResults.validations.push({
          type: 'HARVEST_DENSITY',
          status: 'APPROVED',
          message: 'Sustainable harvest density in area',
          severity: 'LOW'
        });
      }

      // Overall compliance status
      const hasRestrictions = validationResults.validations.some(v => v.status === 'RESTRICTED');
      const hasWarnings = validationResults.validations.some(v => v.status === 'WARNING');
      
      validationResults.overall_status = hasRestrictions ? 'RESTRICTED' : hasWarnings ? 'WARNING' : 'APPROVED';
      validationResults.can_proceed = !hasRestrictions;

      res.json({
        message: 'Harvest compliance validation completed',
        validation: validationResults
      });

    } catch (error) {
      console.error('Validate harvest compliance error:', error);
      res.status(500).json({ error: 'Failed to validate harvest compliance' });
    }
  }

  // Get harvest recommendations
  static async getHarvestRecommendations(req, res) {
    try {
      const { species_id, latitude, longitude } = req.query;

      if (!species_id) {
        return res.status(400).json({ error: 'Species ID is required' });
      }

      const species = await Species.findById(species_id);
      if (!species) {
        return res.status(400).json({ error: 'Species not found' });
      }

      // Get recent harvest data for the species
      const recentHarvests = await CollectionEvent.find({
        species_id,
        timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: -1 }).limit(50);

      // Analyze patterns
      const harvestMethods = [...new Set(recentHarvests.map(h => h.harvest_method))];
      const qualityMetrics = recentHarvests.map(h => h.initial_quality_metrics).filter(Boolean);

      const recommendations = {
        species_info: {
          name: species.common_name,
          scientific_name: species.scientific_name,
          guidelines: species.nmfs_guidelines
        },
        optimal_conditions: {
          seasonal_timing: species.seasonal_restrictions,
          approved_methods: harvestMethods,
          quality_indicators: qualityMetrics.slice(0, 5)
        },
        sustainability_notes: [
          "Follow rotating harvest areas to prevent over-collection",
          "Maintain minimum 30% of population unharvested",
          "Document GPS coordinates accurately",
          "Report any unusual environmental conditions"
        ],
        best_practices: [
          "Harvest during early morning hours for optimal quality",
          "Use clean, sharp tools to minimize plant damage",
          "Store collected material in breathable containers",
          "Process within 24 hours of collection"
        ]
      };

      // Location-specific recommendations if coordinates provided
      if (latitude && longitude) {
        const nearbyHarvests = await CollectionEvent.find({
          species_id,
          latitude: { $gte: parseFloat(latitude) - 0.05, $lte: parseFloat(latitude) + 0.05 },
          longitude: { $gte: parseFloat(longitude) - 0.05, $lte: parseFloat(longitude) + 0.05 },
          timestamp: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
        });

        if (nearbyHarvests.length > 3) {
          recommendations.location_alert = {
            type: 'HIGH_ACTIVITY',
            message: 'Consider alternative location - recent harvest activity detected in area',
            recent_collections: nearbyHarvests.length
          };
        }
      }

      res.json({
        message: 'Harvest recommendations retrieved successfully',
        recommendations
      });

    } catch (error) {
      console.error('Get harvest recommendations error:', error);
      res.status(500).json({ error: 'Failed to get harvest recommendations' });
    }
  }

  // Bulk import collection events (for CSV uploads)
  static async bulkImportEvents(req, res) {
    try {
      const { events } = req.body;

      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: 'Events array is required' });
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const eventData of events) {
        try {
          // Validate required fields
          if (!eventData.species_id || !eventData.latitude || !eventData.longitude) {
            results.failed++;
            results.errors.push({
              event: eventData,
              error: 'Missing required fields: species_id, latitude, longitude'
            });
            continue;
          }

          const collectionEvent = new CollectionEvent({
            ...eventData,
            timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date()
          });

          await collectionEvent.save();
          results.successful++;

        } catch (error) {
          results.failed++;
          results.errors.push({
            event: eventData,
            error: error.message
          });
        }
      }

      res.status(results.failed > 0 ? 207 : 201).json({
        message: `Bulk import completed: ${results.successful} successful, ${results.failed} failed`,
        results
      });

    } catch (error) {
      console.error('Bulk import events error:', error);
      res.status(500).json({ error: 'Failed to bulk import events' });
    }
  }
}

module.exports = CollectionEventController;