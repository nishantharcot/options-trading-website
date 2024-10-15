import express from 'express';
import { addMoney, mintTokens } from '../controllers/userController.js';

const router = express.Router();

router.post('/onramp/inr', addMoney);
router.post('/trade/mint', mintTokens);

export default router;
