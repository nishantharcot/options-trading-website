import express from "express";
import userRoutes from "./routes/userRoutes.js";
import symbolRoutes from "./routes/symbolRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import { INR_BALANCES } from "./data/balances.js";
import { STOCK_BALANCES } from "./data/balances.js";

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/symbol", symbolRoutes);
app.use("/order", orderRoutes);
app.use("/balance", balanceRoutes);

// Onramp INR
app.post("/onramp/inr", (req, res) => {
  const userId = req.body.userId;
  const amount = req.body.amount;

  if (!INR_BALANCES.hasOwnProperty(userId)) {
    res.status(400).json({ message: "User already exists!" });
  }

  INR_BALANCES[userId].balance += amount;
  res.status(200).json({ message: `Onramped ${userId} with amount ${amount}` });
});

app.post("/trade/mint", (req, res) => {
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
});

// Get INR Balances
app.get("/balances/inr", (_, res) => {
  res.send(INR_BALANCES);
});

export default app;
