import axios from 'axios';

// In-memory cache to respect API usage and prevent duplicate requests
const geocodeCache = new Map();
const attractionsCache = new Map();

const HEADERS = {
  'User-Agent': 'PlanMyTrip/1.0 (travel@planmytrip.app)',
  'Accept': 'application/json'
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/**
 * Search destinations via Nominatim for autocomplete
 */
export async function searchDestinations(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query.trim(),
        format: 'json',
        addressdetails: 1,
        limit: 6,
        featuretype: 'city,settlement'
      },
      headers: HEADERS,
      timeout: 8000
    });

    const results = (response.data || []).map(item => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      country: item.address?.country || '',
      countryCode: item.address?.country_code || '',
      state: item.address?.state || ''
    }));

    geocodeCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Nominatim search error:', error.message);
    return [];
  }
}

/**
 * Get coordinates for a destination
 */
export async function getDestinationCoordinates(destination) {
  if (!destination) return null;
  const results = await searchDestinations(destination);
  if (results && results.length > 0) {
    return results[0];
  }
  return null;
}

/**
 * Map user interests to Overpass query tags
 */
function buildOverpassTagFilter(interests = []) {
  const interestLower = (interests || []).map(i => i.toLowerCase());
  const tagClauses = [];

  // Default core tourism tags
  tagClauses.push('node["tourism"~"attraction|museum|viewpoint|theme_park"](around:20000,{LAT},{LON});');
  tagClauses.push('way["tourism"~"attraction|museum|viewpoint|theme_park"](around:20000,{LAT},{LON});');

  if (interestLower.some(i => i.includes('history') || i.includes('cultural'))) {
    tagClauses.push('node["historic"~"monument|castle|palace|ruins|memorial|fort|archaeological_site"](around:20000,{LAT},{LON});');
    tagClauses.push('way["historic"~"monument|castle|palace|ruins|memorial|fort|archaeological_site"](around:20000,{LAT},{LON});');
  }

  if (interestLower.some(i => i.includes('nature') || i.includes('mountains') || i.includes('wildlife'))) {
    tagClauses.push('node["leisure"="park"](around:20000,{LAT},{LON});');
    tagClauses.push('way["leisure"="park"](around:20000,{LAT},{LON});');
    tagClauses.push('node["natural"~"peak|beach|cave_entrance"](around:25000,{LAT},{LON});');
  }

  if (interestLower.some(i => i.includes('beach'))) {
    tagClauses.push('node["natural"="beach"](around:25000,{LAT},{LON});');
    tagClauses.push('way["natural"="beach"](around:25000,{LAT},{LON});');
  }

  if (interestLower.some(i => i.includes('food') || i.includes('nightlife'))) {
    tagClauses.push('node["amenity"~"restaurant|cafe|pub|bar"](around:15000,{LAT},{LON});');
  }

  return tagClauses.join('');
}

/**
 * Fetch real attractions from Overpass API
 */
export async function fetchAttractions(lat, lon, interests = [], limit = 30) {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (attractionsCache.has(cacheKey)) {
    return attractionsCache.get(cacheKey);
  }

  const queryTags = buildOverpassTagFilter(interests)
    .replaceAll('{LAT}', lat)
    .replaceAll('{LON}', lon);

  const query = `[out:json][timeout:20];(${queryTags});out center ${limit};`;

  let data = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(
        endpoint,
        'data=' + encodeURIComponent(query),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...HEADERS
          },
          timeout: 12000
        }
      );
      if (response.data && response.data.elements) {
        data = response.data;
        break;
      }
    } catch (err) {
      console.warn(`Overpass endpoint ${endpoint} failed: ${err.message}. Trying next mirror...`);
    }
  }

  if (!data || !data.elements) {
    return [];
  }

  // Parse and normalize elements
  const seenNames = new Set();
  const attractions = [];

  for (const el of data.elements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'];
    if (!name || seenNames.has(name.toLowerCase())) continue;
    seenNames.add(name.toLowerCase());

    const itemLat = el.lat || el.center?.lat;
    const itemLon = el.lon || el.center?.lon;
    if (!itemLat || !itemLon) continue;

    // Categorize
    let category = 'Sightseeing';
    if (tags.historic || tags.heritage) category = 'Historical & Heritage';
    else if (tags.tourism === 'museum') category = 'Museum & Art';
    else if (tags.tourism === 'viewpoint') category = 'Scenic Viewpoint';
    else if (tags.natural === 'beach') category = 'Beach & Coastal';
    else if (tags.leisure === 'park' || tags.natural === 'peak') category = 'Nature & Outdoors';
    else if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') category = 'Food & Dining';

    attractions.push({
      id: `${el.type}_${el.id}`,
      name: name,
      category,
      latitude: itemLat,
      longitude: itemLon,
      address: tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : null,
      openingHours: tags.opening_hours || null,
      fee: tags.fee === 'no' ? 0 : (tags.charge ? tags.charge : null),
      description: tags.description || tags.wikipedia ? `Explore ${name}, a notable ${category.toLowerCase()} in this region.` : `Visit ${name}, popular with travelers.`
    });
  }

  attractionsCache.set(cacheKey, attractions);
  return attractions;
}

/**
 * Calculate driving route using OSRM
 */
export async function calculateRoute(coordinates = []) {
  if (!coordinates || coordinates.length < 2) {
    return { distanceKm: 0, durationMinutes: 0, coordinates: [] };
  }

  try {
    // Coordinates formatted as lon,lat;lon,lat
    const coordString = coordinates
      .map(c => `${c[1]},${c[0]}`) // Leaflet is [lat, lon], OSRM expects lon,lat
      .join(';');

    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      // OSRM geometry coordinates are [lon, lat], convert back to Leaflet [lat, lon]
      const latLngPoints = (route.geometry?.coordinates || []).map(coord => [coord[1], coord[0]]);

      return {
        distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
        durationMinutes: Math.round(route.duration / 60),
        coordinates: latLngPoints,
        isEstimated: true
      };
    }
  } catch (error) {
    console.warn('OSRM route calculation error:', error.message);
  }

  // Fallback: Haversine distance between waypoints
  let totalKm = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalKm += haversineDistance(coordinates[i][0], coordinates[i][1], coordinates[i + 1][0], coordinates[i + 1][1]);
  }

  return {
    distanceKm: parseFloat(totalKm.toFixed(1)),
    durationMinutes: Math.round(totalKm * 2.5), // Approx 25-30 km/h city average
    coordinates: coordinates,
    isEstimated: true
  };
}

/**
 * Haversine distance between two lat/lon points in km
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
