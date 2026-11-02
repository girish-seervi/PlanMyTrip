import { calculateRoute } from '../services/osmService.js';

export async function handleCalculateRoute(req, res) {
  try {
    const { coordinates } = req.body;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({ error: 'At least two coordinate pairs are required.' });
    }

    const routeData = await calculateRoute(coordinates);
    res.json({
      success: true,
      route: routeData
    });
  } catch (error) {
    console.error('Route calculation error:', error.message);
    res.status(500).json({ error: 'Failed to calculate route.' });
  }
}
