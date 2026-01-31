import express from 'express';
import * as locationController from './controller.js';

const router = express.Router();

router.get('/geocode', locationController.geocode);
router.get('/reverse-geocode', locationController.reverseGeocode);
router.get('/calculate-distance', locationController.calculateDistance);
router.get('/nearby', locationController.findNearby);

export default router;
