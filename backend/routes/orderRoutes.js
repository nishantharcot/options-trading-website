import express from 'express';
import { buyYes, sellYes, buyNo, sellNo } from '../controllers/orderController.js';

const router = express.Router();

router.post('/buy/yes', buyYes);
router.post('/sell/yes', sellYes);
router.post('/buy/no', buyNo);
router.post('/sell/no', sellNo);

export default router;
