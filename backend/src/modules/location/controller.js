import * as locationService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const geocode = async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return errorResponse(res, 'Address is required', 400);
        }

        const result = await locationService.geocodeAddress(address);
        return successResponse(res, result, 'Address geocoded successfully');
    } catch (error) {
        logger.error(`Error in geocode: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const reverseGeocode = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        const result = await locationService.reverseGeocode(
            parseFloat(latitude),
            parseFloat(longitude)
        );
        return successResponse(res, result, 'Location reverse geocoded successfully');
    } catch (error) {
        logger.error(`Error in reverseGeocode: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const calculateDistance = async (req, res) => {
    try {
        const { lat1, lon1, lat2, lon2 } = req.query;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
            return errorResponse(res, 'All coordinates are required', 400);
        }

        const distance = locationService.calculateDistance(
            parseFloat(lat1),
            parseFloat(lon1),
            parseFloat(lat2),
            parseFloat(lon2)
        );

        return successResponse(
            res,
            { distance: distance.toFixed(2), unit: 'km' },
            'Distance calculated successfully'
        );
    } catch (error) {
        logger.error(`Error in calculateDistance: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const findNearby = async (req, res) => {
    try {
        const { latitude, longitude, type, radius = 5000 } = req.query;

        if (!latitude || !longitude) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        const results = await locationService.findNearbyLocations(
            parseFloat(latitude),
            parseFloat(longitude),
            type,
            parseInt(radius)
        );

        return successResponse(res, results, 'Nearby locations found successfully');
    } catch (error) {
        logger.error(`Error in findNearby: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
