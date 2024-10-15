import { ORDERBOOK } from '../data/orderbook.js';

export const createSymbol = (req, res) => {
  const stockSymbol = req.params.stockSymbol;

  if (ORDERBOOK.hasOwnProperty(stockSymbol)) {
    res.status(400).json({ message: "Stock already exists!" });
  } else {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    res.status(201).json({ message: `Symbol ${stockSymbol} created` });
  }
};
