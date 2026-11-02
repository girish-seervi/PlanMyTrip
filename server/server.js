import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import itineraryRoutes from './routes/itineraryRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import routesRoutes from './routes/routesRoutes.js';
import configRoutes from './routes/configRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PlanMyTrip API',
    version: '1.0.0',
    nvidiaKeySet: Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_api_key_here')
  });
});

// Register API Routes
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/config', configRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 PlanMyTrip Backend Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 NVIDIA NIM Model: nvidia/nemotron-3.5-lightning-30b-a3b`);
  console.log(`🔑 NVIDIA API Key configured: ${Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_api_key_here')}`);
  console.log(`======================================================\n`);
});
