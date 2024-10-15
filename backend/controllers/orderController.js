import { YES_TRACKER, NO_TRACKER } from "../data/tracker.js";
import { INR_BALANCES, STOCK_BALANCES } from "../data/balances.js";

export const buyYes = (req, res) => {
  // Your existing code for buying a 'yes' order, broken down here.
  let { userId, stockSymbol, quantity, price } = req.body;
  const userBalance = INR_BALANCES[userId].balance;

  if (userBalance - quantity * price < 0) {
    res.status(400).json({ message: "Insufficient INR balance" });
  }

  if (!YES_TRACKER.hasOwnProperty(stockSymbol)) {
    YES_TRACKER[stockSymbol] = [[], []];
    YES_TRACKER[stockSymbol][0].push({
      userId: userId,
      quantity: quantity,
      price: price,
    });

    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity * price;

    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]["yes"] = {
        quantity: 0,
        locked: quantity,
      };
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {
        yes: {
          quantity: 0,
          locked: quantity,
        },
      };
    }

    // ORDERBOOK update

    res.status(200).json({ message: "Buy order placed and pending" });
  }

  // CHECK IF MATCHING SELL ORDER
  YES_TRACKER[stockSymbol][1] = YES_TRACKER[stockSymbol][1].map(
    (sellOrder, _) => {
      if (sellOrder.price === price) {
        const {
          userId: sellerUserId,
          quantity: sellerQuantity,
          price,
        } = sellOrder;

        if (sellerQuantity > quantity) {
          sellOrder.quantity -= quantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= quantity * price;
          INR_BALANCES[sellerUserId].balance += quantity * price;
          INR_BALANCES[sellerUserId].locked -= quantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

          // ORDERBOOK update
          quantity = 0;

          return sellOrder;
        } else {
          quantity = quantity - sellerQuantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= sellerQuantity * price;

          INR_BALANCES[sellerUserId].balance += sellerQuantity * price;

          INR_BALANCES[sellerUserId].locked -= sellerQuantity * price;

          // STOCK_BALANCES update
          if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
            STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
          } else {
            STOCK_BALANCES[userId][stockSymbol] = { quantity: sellerQuantity };
          }
          STOCK_BALANCES[sellerUserId][stockSymbol].quantity -= sellerQuantity;

          return undefined;
        }
      }
    }
  );

  YES_TRACKER[stockSymbol][1] = YES_TRACKER[stockSymbol][1].filter(
    (sellOrder, _) => {
      return sellOrder !== undefined;
    }
  );

  if (quantity === 0) {
    res.status(200).json({ message: "Buy order placed and trade executed" });
  } else {
    res.status(200).json({ message: "Buy order placed and pending" });
  }
};

export const sellYes = (req, res) => {
  // Your existing code for selling a 'yes' order.
  let { userId, stockSymbol, quantity, price } = req.body;

  if (!YES_TRACKER.hasOwnProperty(stockSymbol)) {
    YES_TRACKER[stockSymbol] = [[], []];
    YES_TRACKER[stockSymbol][1].push({
      userId: userId,
      quantity: quantity,
      price: price,
    });

    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity * price;

    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]["yes"] = {
        quantity: 0,
        locked: quantity,
      };
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {
        yes: {
          quantity: 0,
          locked: quantity,
        },
      };
    }

    // ORDERBOOK update
    res.status(200).json({
      message: `Sell order placed for ${quantity} 'yes' options at price ${price}.`,
    });
  }

  // CHECK IF MATCHING BUY ORDER
  YES_TRACKER[stockSymbol][0] = YES_TRACKER[stockSymbol][0].map(
    (sellOrder, _) => {
      if (sellOrder.price === price) {
        const {
          userId: sellerUserId,
          stockSymbol,
          quantity: sellerQuantity,
          price,
        } = sellOrder;

        if (sellOrder.quantity > quantity) {
          sellOrder.quantity -= quantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= quantity * price;
          INR_BALANCES[sellerUserId].balance += quantity * price;
          INR_BALANCES[sellerUserId].locked -= quantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

          // ORDERBOOK update

          quantity = 0;

          return sellOrder;
        } else {
          quantity -= sellerQuantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= sellerQuantity * price;
          INR_BALANCES[sellerUserId].balance += sellerQuantity * price;
          INR_BALANCES[sellerUserId].locked -= sellerQuantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= sellerQuantity;

          return undefined;
        }
      }
    }
  );

  YES_TRACKER[stockSymbol][0] = YES_TRACKER[stockSymbol][0].filter(
    (sellOrder, _) => {
      return sellOrder !== undefined;
    }
  );

  if (quantity === 0) {
    res.status(200).json({ message: `Sell order matched at price ${price}` });
  } else {
    res.status(200).json({ message: "Sell order placed and pending" });
  }
};

export const buyNo = (req, res) => {
  // Your existing code for buying a 'yes' order, broken down here.
  let { userId, stockSymbol, quantity, price } = req.body;
  const userBalance = INR_BALANCES[userId].balance;

  if (userBalance - quantity * price < 0) {
    res.status(400).json({ message: "Insufficient INR balance" });
  }

  if (!NO_TRACKER.hasOwnProperty(stockSymbol)) {
    NO_TRACKER[stockSymbol] = [[], []];
    NO_TRACKER[stockSymbol][0].push({
      userId: userId,
      quantity: quantity,
      price: price,
    });

    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity * price;

    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]["yes"] = {
        quantity: 0,
        locked: quantity,
      };
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {
        yes: {
          quantity: 0,
          locked: quantity,
        },
      };
    }

    // ORDERBOOK update

    res.status(200).json({ message: "Buy order placed and pending" });
  }

  // CHECK IF MATCHING SELL ORDER
  NO_TRACKER[stockSymbol][1] = NO_TRACKER[stockSymbol][1].map(
    (sellOrder, _) => {
      if (sellOrder.price === price) {
        const {
          userId: sellerUserId,
          quantity: sellerQuantity,
          price,
        } = sellOrder;

        if (sellerQuantity > quantity) {
          sellOrder.quantity -= quantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= quantity * price;
          INR_BALANCES[sellerUserId].balance += quantity * price;
          INR_BALANCES[sellerUserId].locked -= quantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

          // ORDERBOOK update
          quantity = 0;

          return sellOrder;
        } else {
          quantity = quantity - sellerQuantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= sellerQuantity * price;

          INR_BALANCES[sellerUserId].balance += sellerQuantity * price;

          INR_BALANCES[sellerUserId].locked -= sellerQuantity * price;

          // STOCK_BALANCES update
          if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
            STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
          } else {
            STOCK_BALANCES[userId][stockSymbol] = { quantity: sellerQuantity };
          }
          STOCK_BALANCES[sellerUserId][stockSymbol].quantity -= sellerQuantity;

          return undefined;
        }
      }
    }
  );

  NO_TRACKER[stockSymbol][1] = NO_TRACKER[stockSymbol][1].filter(
    (sellOrder, _) => {
      return sellOrder !== undefined;
    }
  );

  if (quantity === 0) {
    res.status(200).json({ message: "Buy order placed and trade executed" });
  } else {
    res.status(200).json({ message: "Buy order placed and pending" });
  }
};

export const sellNo = (req, res) => {
  // Your existing code for selling a 'yes' order.
  let { userId, stockSymbol, quantity, price } = req.body;

  if (!NO_TRACKER.hasOwnProperty(stockSymbol)) {
    NO_TRACKER[stockSymbol] = [[], []];
    NO_TRACKER[stockSymbol][1].push({
      userId: userId,
      quantity: quantity,
      price: price,
    });

    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity * price;

    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]["yes"] = {
        quantity: 0,
        locked: quantity,
      };
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {
        yes: {
          quantity: 0,
          locked: quantity,
        },
      };
    }

    // ORDERBOOK update
    res.status(200).json({
      message: `Sell order placed for ${quantity} 'yes' options at price ${price}.`,
    });
  }

  // CHECK IF MATCHING BUY ORDER
  NO_TRACKER[stockSymbol][0] = NO_TRACKER[stockSymbol][0].map(
    (sellOrder, _) => {
      if (sellOrder.price === price) {
        const {
          userId: sellerUserId,
          stockSymbol,
          quantity: sellerQuantity,
          price,
        } = sellOrder;

        if (sellOrder.quantity > quantity) {
          sellOrder.quantity -= quantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= quantity * price;
          INR_BALANCES[sellerUserId].balance += quantity * price;
          INR_BALANCES[sellerUserId].locked -= quantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

          // ORDERBOOK update

          quantity = 0;

          return sellOrder;
        } else {
          quantity -= sellerQuantity;

          // INR_BALANCES update
          INR_BALANCES[userId].balance -= sellerQuantity * price;
          INR_BALANCES[sellerUserId].balance += sellerQuantity * price;
          INR_BALANCES[sellerUserId].locked -= sellerQuantity * price;

          // STOCK_BALANCES update
          STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
          STOCK_BALANCES[sellerUserId][stockSymbol].locked -= sellerQuantity;

          return undefined;
        }
      }
    }
  );

  NO_TRACKER[stockSymbol][0] = NO_TRACKER[stockSymbol][0].filter(
    (sellOrder, _) => {
      return sellOrder !== undefined;
    }
  );

  if (quantity === 0) {
    res.status(200).json({ message: `Sell order matched at price ${price}` });
  } else {
    res.status(200).json({ message: "Sell order placed and pending" });
  }
};
