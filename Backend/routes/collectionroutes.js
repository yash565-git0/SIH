const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const CollectionController = require("../controller/collectioncontroller");
const {authenticateToken}= require('../controller/authcontroller');
const collectionValidation = [
  body("species_id").notEmpty().withMessage("Species ID is required"),
  body("collector_id").notEmpty().withMessage("Collector ID is required"),
  body("cooperative_id").notEmpty().withMessage("Cooperative ID is required"),
  body("timestamp").optional().isISO8601().withMessage("Invalid timestamp"),
  body("initial_quality_metrics").optional().isObject().withMessage("Quality metrics must be an object"),
];

router.post("/",authenticateToken, collectionValidation, CollectionController.createCollectionEvent);
router.get("/", CollectionController.getCollectionEvents);
router.get("/:eventId", param("eventId").isMongoId(), CollectionController.getCollectionEventDetails); 
router.put("/:eventId",authenticateToken, param("eventId").isMongoId(), CollectionController.updateCollectionEvent); 

router.get("/statistics", CollectionController.getCollectionStatistics);
router.post("/validate-compliance", CollectionController.validateHarvestCompliance);
router.get("/recommendations", CollectionController.getHarvestRecommendations);
router.post("/bulk-import", CollectionController.bulkImportEvents);


module.exports = router;