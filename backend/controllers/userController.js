import { INR_BALANCES, STOCK_BALANCES } from '../data/balances.js';

export const createUser = (req, res) => {
  const userId = req.params.userId;

  if (INR_BALANCES.hasOwnProperty(userId)) {
    res.status(400).json({ message: "User already exists!" });
  } else {
    INR_BALANCES[userId] = { balance: 0, locked: 0 };
    STOCK_BALANCES[userId] = {};
    res.status(201).json({ message: `User ${userId} created` });
  }
};
