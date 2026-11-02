import express from 'express';
import { handleCalculateRoute } from '../controllers/routesController.js';

const router = express.Router();

router.post('/calculate', handleCalculateRoute);

export default router;
