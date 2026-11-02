import { searchDestinations, fetchAttractions, getDestinationCoordinates } from '../services/osmService.js';

export async function handleSearchPlaces(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const results = await searchDestinations(q);
    res.json({ results });
  } catch (error) {
    console.error('Places search error:', error.message);
    res.status(500).json({ error: 'Failed to search places.' });
  }
}

export async function handleGetAttractions(req, res) {
  try {
    const { lat, lon, destination, interests } = req.query;
    let targetLat = parseFloat(lat);
    let targetLon = parseFloat(lon);

    if (isNaN(targetLat) || isNaN(targetLon)) {
      if (destination) {
        const coords = await getDestinationCoordinates(destination);
        if (coords) {
          targetLat = coords.lat;
          targetLon = coords.lon;
        }
      }
    }

    if (isNaN(targetLat) || isNaN(targetLon)) {
      return res.status(400).json({ error: 'Coordinates or destination name are required.' });
    }

    const interestList = interests ? (Array.isArray(interests) ? interests : interests.split(',')) : [];
    const attractions = await fetchAttractions(targetLat, targetLon, interestList, 30);

    res.json({ attractions });
  } catch (error) {
    console.error('Get attractions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch attractions.' });
  }
}
