import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 65000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Autocomplete search for destinations
 */
export async function searchDestinations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await api.get('/places/search', { params: { q: query } });
    return res.data?.results || [];
  } catch (err) {
    console.error('Failed to search destinations:', err);
    return [];
  }
}

/**
 * Generate full trip itinerary using NVIDIA Nemotron
 */
export async function generateItinerary(payload, userApiKey = null) {
  const body = {
    ...payload,
    apiKey: userApiKey || undefined
  };
  const res = await api.post('/itinerary/generate', body);
  return res.data;
}

/**
 * Regenerate a specific day using AI
 */
export async function regenerateDay(payload, userApiKey = null) {
  const body = {
    ...payload,
    apiKey: userApiKey || undefined
  };
  const res = await api.post('/itinerary/regenerate-day', body);
  return res.data;
}

/**
 * Optimize an itinerary's route
 */
export async function optimizeItinerary(itinerary) {
  const res = await api.post('/itinerary/optimize', { itinerary });
  return res.data;
}

/**
 * Calculate routing geometry using OSRM
 */
export async function calculateRoute(coordinates) {
  const res = await api.post('/routes/calculate', { coordinates });
  return res.data?.route;
}

/**
 * Fetch server health & key status
 */
export async function checkServerStatus() {
  try {
    const res = await api.get('/config/status');
    return res.data;
  } catch (err) {
    return { status: 'offline', nvidiaKeyConfigured: false };
  }
}

/**
 * Verify custom NVIDIA API key
 */
export async function verifyNvidiaKey(apiKey) {
  const res = await api.post('/config/verify-key', { apiKey });
  return res.data;
}

export default api;
