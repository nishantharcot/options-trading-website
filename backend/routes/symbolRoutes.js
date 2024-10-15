import express from 'express';
import { createSymbol } from '../controllers/symbolController.js';

const router = express.Router();

router.post('/create/:stockSymbol', createSymbol);

export default router;
