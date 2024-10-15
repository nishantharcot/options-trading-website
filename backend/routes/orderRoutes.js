import express from 'express';
import { buyYes, sellYes, buyNo, sellNo, mintTokens } from '../controllers/orderController.js';

const router = express.Router();

router.post('/buy/yes', buyYes);
router.post('/sell/yes', sellYes);
router.post('/buy/no', buyNo);
router.post('/sell/no', sellNo);
router.post('/mint', mintTokens);

export default router;
