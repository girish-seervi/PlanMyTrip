import { getDestinationCoordinates, fetchAttractions, calculateRoute } from '../services/osmService.js';
import { generateItinerary, regenerateDay } from '../services/nvidiaService.js';
import { optimizeItinerary } from '../services/optimizerService.js';

export async function handleGenerateItinerary(req, res) {
  try {
    const {
      destination,
      startDate,
      endDate,
      duration,
      travelers = 2,
      budget = 15000,
      travelStyle = 'Cultural',
      interests = ['History', 'Food', 'Sightseeing'],
      apiKey
    } = req.body;

    if (!destination || !destination.trim()) {
      return res.status(400).json({ error: 'Destination is required.' });
    }

    const tripDuration = parseInt(duration, 10) || 3;
    if (tripDuration < 1 || tripDuration > 14) {
      return res.status(400).json({ error: 'Trip duration must be between 1 and 14 days.' });
    }

    console.log(`[Itinerary] Generating ${tripDuration}-day trip for "${destination}"...`);

    // Step 1: Geocode destination
    const destinationCoords = await getDestinationCoordinates(destination);
    if (!destinationCoords) {
      return res.status(404).json({
        error: `Could not locate destination "${destination}". Please check spelling or select from suggestions.`
      });
    }

    // Step 2: Fetch real-world attractions from Overpass API
    console.log(`[Itinerary] Fetching verified attractions near ${destinationCoords.lat}, ${destinationCoords.lon}...`);
    let realAttractions = await fetchAttractions(
      destinationCoords.lat,
      destinationCoords.lon,
      interests,
      35
    );

    console.log(`[Itinerary] Retrieved ${realAttractions.length} real attractions.`);

    // If Overpass returned few or no elements (e.g. remote area), create baseline points from destination
    if (realAttractions.length === 0) {
      realAttractions = [
        {
          name: `${destination} City Center & Promenade`,
          category: 'Sightseeing',
          latitude: destinationCoords.lat,
          longitude: destinationCoords.lon,
          description: `Explore the vibrant heart and landmarks of ${destination}.`
        },
        {
          name: `${destination} Heritage Bazaar & Old Quarter`,
          category: 'Cultural & Shopping',
          latitude: destinationCoords.lat + 0.008,
          longitude: destinationCoords.lon + 0.008,
          description: `Stroll through historic streets, artisan shops and local markets.`
        },
        {
          name: `${destination} Scenic Sunset Point`,
          category: 'Scenic Viewpoint',
          latitude: destinationCoords.lat - 0.009,
          longitude: destinationCoords.lon + 0.007,
          description: `Panoramic views of the skyline and surrounding landscape.`
        }
      ];
    }

    // Step 3: Call NVIDIA Nemotron AI
    const effectiveKey = apiKey || process.env.NVIDIA_API_KEY;
    const itinerary = await generateItinerary({
      destination: destinationCoords.name,
      destinationCoordinates: destinationCoords,
      startDate,
      endDate,
      duration: tripDuration,
      travelers: parseInt(travelers, 10) || 1,
      budget: parseFloat(budget) || 10000,
      travelStyle,
      interests,
      realAttractions,
      apiKey: effectiveKey
    });

    res.json({
      success: true,
      itinerary,
      realAttractionsCount: realAttractions.length
    });

  } catch (error) {
    console.error('[Itinerary] Generation error:', error.message);
    const statusCode = error.message.includes('NVIDIA_API_KEY') ? 401 : 500;
    res.status(statusCode).json({
      error: error.message || 'An error occurred while generating your itinerary with AI.'
    });
  }
}

export async function handleRegenerateDay(req, res) {
  try {
    const {
      destination,
      dayNumber = 1,
      tripContext = {},
      allExistingAttractionNames = [],
      destinationCoordinates,
      interests = [],
      apiKey
    } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required.' });
    }

    let coords = destinationCoordinates;
    if (!coords) {
      coords = await getDestinationCoordinates(destination);
    }

    let realAttractions = [];
    if (coords && coords.lat && coords.lon) {
      realAttractions = await fetchAttractions(coords.lat, coords.lon, interests, 30);
    }

    const effectiveKey = apiKey || process.env.NVIDIA_API_KEY;
    const updatedDay = await regenerateDay({
      destination,
      dayNumber: parseInt(dayNumber, 10),
      tripContext,
      allExistingAttractionNames,
      realAttractions,
      apiKey: effectiveKey
    });

    res.json({
      success: true,
      day: updatedDay
    });
  } catch (error) {
    console.error('[Itinerary] Day regeneration error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to regenerate day with AI.'
    });
  }
}

export async function handleOptimizeItinerary(req, res) {
  try {
    const { itinerary } = req.body;
    if (!itinerary || !itinerary.days) {
      return res.status(400).json({ error: 'Valid itinerary is required for optimization.' });
    }

    const result = optimizeItinerary(itinerary);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Itinerary] Optimization error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to optimize itinerary.'
    });
  }
}
