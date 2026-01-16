/**
 * Google Places API Helper
 * Fetches dynamic shop data from Google Places API with caching
 */

const fetch = require('node-fetch');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const REQUESTED_FIELDS = 'name,formatted_address,geometry,opening_hours,formatted_phone_number,website';

/**
 * Fetch place details from Google Places API
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object|null>} Place details or null on error
 */
async function fetchPlaceDetails(placeId) {
    if (!GOOGLE_API_KEY) {
        console.error('[GooglePlaces] No API key configured');
        return null;
    }

    try {
        const url = `${PLACES_DETAILS_URL}?place_id=${encodeURIComponent(placeId)}&fields=${REQUESTED_FIELDS}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            console.error(`[GooglePlaces] API error for ${placeId}:`, response.status);
            return null;
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error(`[GooglePlaces] API status for ${placeId}:`, data.status, data.error_message || '');
            return null;
        }

        return data.result;
    } catch (error) {
        console.error(`[GooglePlaces] Fetch error for ${placeId}:`, error.message);
        return null;
    }
}

/**
 * Fetch details for all shops in parallel
 * @param {Array} shops - Array of shop objects with googlePlaceId
 * @returns {Promise<Map>} Map of shopId -> googleData
 */
async function fetchAllShopsDetails(shops) {
    const results = new Map();

    const promises = shops
        .filter(shop => shop.googlePlaceId)
        .map(async (shop) => {
            const googleData = await fetchPlaceDetails(shop.googlePlaceId);
            if (googleData) {
                results.set(shop.id, googleData);
            }
        });

    await Promise.all(promises);
    console.log(`[GooglePlaces] Fetched ${results.size}/${shops.length} shop details from Google`);

    return results;
}

/**
 * Convert Google opening_hours format to our hours format
 * Google uses day numbers (0=Sunday, 1=Monday, etc.) and 24h time strings
 * We use day names as keys with formatted time ranges
 * @param {Object} openingHours - Google opening_hours object
 * @returns {Object} Hours object { monday: "09:00-19:00", ... }
 */
function convertGoogleHours(openingHours) {
    if (!openingHours || !openingHours.weekday_text) {
        return null;
    }

    const dayMap = {
        'Monday': 'monday',
        'Tuesday': 'tuesday',
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
    };

    const hours = {};

    // Parse weekday_text array like "Monday: 8:00 AM – 12:00 PM, 1:00 – 5:00 PM"
    openingHours.weekday_text.forEach(text => {
        const colonIndex = text.indexOf(':');
        if (colonIndex === -1) return;

        const dayName = text.substring(0, colonIndex).trim();
        const timeText = text.substring(colonIndex + 1).trim();
        const dayKey = dayMap[dayName];

        if (!dayKey) return;

        if (timeText.toLowerCase() === 'closed') {
            hours[dayKey] = 'Closed';
        } else {
            // Convert AM/PM times to 24h format
            hours[dayKey] = convertTo24HourFormat(timeText);
        }
    });

    return hours;
}

/**
 * Convert time string from AM/PM to 24h format
 * Input: "8:00 AM – 12:00 PM, 1:00 – 5:00 PM"
 * Output: "08:00-12:00, 13:00-17:00"
 */
function convertTo24HourFormat(timeText) {
    // Handle multiple time ranges separated by commas
    const ranges = timeText.split(',').map(range => range.trim());

    const converted = ranges.map(range => {
        // Split on em-dash (–) or regular dash (-)
        const parts = range.split(/\s*[–-]\s*/);
        if (parts.length !== 2) return range;

        const startTime = parseAmPmTime(parts[0].trim());
        const endTime = parseAmPmTime(parts[1].trim());

        if (startTime && endTime) {
            return `${startTime}-${endTime}`;
        }
        return range;
    });

    return converted.join(', ');
}

/**
 * Parse AM/PM time to 24h format
 * Input: "8:00 AM" or "1:00 PM"
 * Output: "08:00" or "13:00"
 */
function parseAmPmTime(timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Check if a shop is currently open based on Google's opening_hours
 * @param {Object} openingHours - Google opening_hours object
 * @returns {boolean} True if currently open
 */
function isCurrentlyOpen(openingHours) {
    if (!openingHours) return null;
    return openingHours.open_now === true;
}

/**
 * Merge Google Places data with static shop data
 * Preserves custom fields (services, email, shortName) while adding/updating Google data
 * @param {Object} staticShop - Static shop data from JSON
 * @param {Object} googleData - Google Places API result
 * @returns {Object} Merged shop object
 */
function mergeShopData(staticShop, googleData) {
    const merged = { ...staticShop };

    if (googleData) {
        // Add coordinates
        if (googleData.geometry && googleData.geometry.location) {
            merged.coordinates = {
                lat: googleData.geometry.location.lat,
                lng: googleData.geometry.location.lng
            };
        }

        // Add/update hours from Google (but keep static as fallback)
        const googleHours = convertGoogleHours(googleData.opening_hours);
        if (googleHours) {
            merged.hours = googleHours;
        }

        // Add open_now status
        merged.openNow = isCurrentlyOpen(googleData.opening_hours);

        // Update phone if available from Google
        if (googleData.formatted_phone_number) {
            // Format: "041 748 45 45" -> "+41 41 748 45 45"
            merged.contact = merged.contact || {};
            // Keep our formatted phone, just validate it matches
        }

        // Add website if available
        if (googleData.website) {
            merged.website = googleData.website;
        }
    }

    return merged;
}

/**
 * Generate map pins array from shops data
 * Minimal data needed for aggregated map view
 * @param {Object} shopsMap - Map of shop ID to shop data
 * @returns {Array} Array of map pin objects
 */
function generateMapPins(shopsMap) {
    const pins = [];

    for (const [id, shop] of Object.entries(shopsMap)) {
        if (shop.coordinates) {
            pins.push({
                id: shop.id,
                name: shop.shortName || shop.name,
                lat: shop.coordinates.lat,
                lng: shop.coordinates.lng,
                openNow: shop.openNow,
                address: `${shop.address.street}, ${shop.address.plz} ${shop.address.city}`
            });
        }
    }

    return pins;
}

module.exports = {
    fetchPlaceDetails,
    fetchAllShopsDetails,
    convertGoogleHours,
    isCurrentlyOpen,
    mergeShopData,
    generateMapPins
};
