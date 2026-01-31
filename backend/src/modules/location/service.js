import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Location Service with Google Maps API Integration
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address) => {
    try {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    address,
                    key: GOOGLE_MAPS_API_KEY
                }
            }
        );

        if (response.data.status !== 'OK') {
            throw new Error(`Geocoding failed: ${response.data.status}`);
        }

        const result = response.data.results[0];
        return {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            formattedAddress: result.formatted_address,
            placeId: result.place_id
        };
    } catch (error) {
        logger.error(`Error geocoding address: ${error.message}`);
        throw error;
    }
};

export const reverseGeocode = async (latitude, longitude) => {
    try {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    latlng: `${latitude},${longitude}`,
                    key: GOOGLE_MAPS_API_KEY
                }
            }
        );

        if (response.data.status !== 'OK') {
            throw new Error(`Reverse geocoding failed: ${response.data.status}`);
        }

        const result = response.data.results[0];
        return {
            formattedAddress: result.formatted_address,
            addressComponents: result.address_components,
            placeId: result.place_id
        };
    } catch (error) {
        logger.error(`Error reverse geocoding: ${error.message}`);
        throw error;
    }
};

export const getDistanceMatrix = async (origins, destinations) => {
    try {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
        const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/distancematrix/json`,
            {
                params: {
                    origins: originsStr,
                    destinations: destinationsStr,
                    key: GOOGLE_MAPS_API_KEY
                }
            }
        );

        if (response.data.status !== 'OK') {
            throw new Error(`Distance matrix failed: ${response.data.status}`);
        }

        return response.data;
    } catch (error) {
        logger.error(`Error getting distance matrix: ${error.message}`);
        throw error;
    }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

export const findNearbyLocations = async (latitude, longitude, type, radius = 5000) => {
    try {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
            {
                params: {
                    location: `${latitude},${longitude}`,
                    radius,
                    type,
                    key: GOOGLE_MAPS_API_KEY
                }
            }
        );

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Nearby search failed: ${response.data.status}`);
        }

        return response.data.results;
    } catch (error) {
        logger.error(`Error finding nearby locations: ${error.message}`);
        throw error;
    }
};
