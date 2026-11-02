import express from 'express';
import {
  handleGenerateItinerary,
  handleRegenerateDay,
  handleOptimizeItinerary
} from '../controllers/itineraryController.js';

const router = express.Router();

router.post('/generate', handleGenerateItinerary);
router.post('/regenerate-day', handleRegenerateDay);
router.post('/optimize', handleOptimizeItinerary);

export default router;
