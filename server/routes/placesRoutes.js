import express from 'express';
import { handleSearchPlaces, handleGetAttractions } from '../controllers/placesController.js';

const router = express.Router();

router.get('/search', handleSearchPlaces);
router.get('/attractions', handleGetAttractions);

export default router;
