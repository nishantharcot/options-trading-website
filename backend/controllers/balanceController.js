import { INR_BALANCES, STOCK_BALANCES } from '../data/balances.js';

export const getINRBalances = (_, res) => {
  res.json(INR_BALANCES);
};

export const getSTOCKBalances = (_, res) => {
  res.json(STOCK_BALANCES);
};

export const getUserINRBalance = (req, res) => {
  const userId = req.params.userId;
  if (INR_BALANCES.hasOwnProperty(userId)) {
    res.json(INR_BALANCES[userId].balance);
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
};

export const getUserStockBalance = (req, res) => {
  const userId = req.params.userId;
  if (STOCK_BALANCES.hasOwnProperty(userId)) {
    res.json(STOCK_BALANCES[userId]);
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
};
