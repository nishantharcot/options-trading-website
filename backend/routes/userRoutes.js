import express from 'express';
import { createUser, addMoney } from '../controllers/userController.js';

const router = express.Router();

router.post('/create/:userId', createUser);
router.post('/onramp/inr', addMoney);

export default router;
