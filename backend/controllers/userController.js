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

export const addMoney = (req, res) => {
  const userId = req.body.userId;
  const amount = req.body.amount;

  if (!INR_BALANCES.hasOwnProperty(userId)) {
    res.status(400).json({ message: "User already exists!" });
  }

  INR_BALANCES[userId].balance += amount;
  res.status(200).json({ message: `Onramped ${userId} with amount ${amount}` });
}

export const mintTokens = (req, res) => {
  const {userId, stockSymbol, quantity, price} = req.body;
  const userBalance = INR_BALANCES[userId].balance;

  if (userBalance < 2*quantity*price) {
    res.status(400).json({ message: "Insufficient INR balance" })
  }


  // INR_BALANCES update
  INR_BALANCES[userId].balance -= 2*quantity*price;
  
  // STOCK_BALANCES update
  if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
    STOCK_BALANCES[userId][stockSymbol]['yes'] = {
      quantity: quantity,
      locked: 0
    }
    STOCK_BALANCES[userId][stockSymbol]['no'] = {
      quantity: quantity,
      locked: 0
    }
  } else {
    STOCK_BALANCES[userId][stockSymbol] = {'yes': {
      quantity: quantity,
      locked: 0
    }}
    STOCK_BALANCES[userId][stockSymbol] = {'no': {
      quantity: quantity,
      locked: 0
    }}
  }

  // ORDERBOOK update

  const remainingBalance = userBalance - 2*(quantity*price);

  res.status(200).json({message: `Minted ${quantity} 'yes' and 'no' tokens for user ${userId}, remaining balance is ${remainingBalance}`})
}