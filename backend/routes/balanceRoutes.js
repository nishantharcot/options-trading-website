import express from 'express';
import { getINRBalances, getSTOCKBalances, getUserINRBalance, getUserStockBalance } from '../controllers/balanceController.js';

const router = express.Router();

router.get('/inr', getINRBalances);
router.get('/stock', getSTOCKBalances);
router.get('/inr/:userId', getUserINRBalance);
router.get('/stock/:userId', getUserStockBalance);

export default router;
