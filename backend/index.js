import express from "express";

const app = express();
app.use(express.json());

const port = 3000;

const INR_BALANCES = {};
const ORDERBOOK = {};
const STOCK_BALANCES = {};

const YES_TRACKER = {};
const NO_BUY_TRACKER = {};






// User creation
app.post("/user/create/:userId", (req, res) => {
  const userId = req.params.userId;

  if (INR_BALANCES.hasOwnProperty(userId)) {
    res.status(400).json({ message: "User already exists!" });
  } else {
    INR_BALANCES[userId] = {
      balance: 0,
      locked: 0,
    };
    STOCK_BALANCES[userId] = {}
    res.status(201).json({ message: `User ${userId} created` });
  }
});

// Symbol creation
app.post("/symbol/create/:stockSymbol", (req, res) => {
  const stockSymbol = req.params.stockSymbol;

  if (ORDERBOOK.hasOwnProperty(stockSymbol)) {
    res.send("Stock already exists!");
  } else {
    ORDERBOOK[stockSymbol] = {
      yes: {},
      no: {},
    };
    res.status(201).json({ message: `Symbol ${stockSymbol} created` });
  }
});

// Get Orderbook
app.get("/orderbook", (_, res) => {
  res.send(JSON.stringify(ORDERBOOK));
});

// Get INR Balances
app.get("/balances/inr", (_, res) => {
  res.send(INR_BALANCES);
});

// Get STOCK balances
app.get("/balances/stock", (_, res) => {
  res.send(JSON.stringify(STOCK_BALANCES));
});

// Get INR balance for a user
app.get("/balance/inr/:userId", (req, res) => {
  const userId = req.params.userId;

  if (INR_BALANCES.hasOwnProperty(userId)) {
    const balance = INR_BALANCES[userId].balance;
    res.send(balance);
  } else {
    res.send('User not found!')
  }
});

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

// Get Stock Balance
app.get("/balance/stock/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!STOCK_BALANCES.hasOwnProperty(userId)) {
    res.send('User not found!');
  }

  res.send(STOCK_BALANCES[userId]);
});

// Buy the yes stock
app.post("/order/buy/yes", (req, res) => {
  let {userId, stockSymbol, quantity, price} = req.body;
  const userBalance = INR_BALANCES[userId].balance;

  if (userBalance - quantity*price < 0) {
    res.status(400).json({ message: "Insufficient INR balance" })
  }

  if (!YES_TRACKER.hasOwnProperty(stockSymbol)) {
    YES_TRACKER[stockSymbol] = [[], []];
    YES_TRACKER[stockSymbol][0].push({userId: userId, quantity: quantity, price: price});

    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity*price;
    
    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]['yes'] = {
        quantity: 0,
        locked: quantity
      }
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {'yes': {
        quantity: 0,
        locked: quantity
      }}
    }

    // ORDERBOOK update

    res.status(200).json({ message: "Buy order placed and pending" })
  }

  // CHECK IF MATCHING SELL ORDER
  YES_TRACKER[stockSymbol][1] = YES_TRACKER[stockSymbol][1].map((sellOrder, _) => {
    if (sellOrder.price === price) {
      const {userId: sellerUserId, quantity: sellerQuantity, price} = sellOrder;

      if (sellerQuantity > quantity) {
        console.log('to you man 1')
        sellOrder.quantity -= quantity;

        console.log("CP4.5:-  ",'user id:- ', userId, 'stockSymbol:- ', stockSymbol, 'quantitty:- ', quantity, "price:- ", price);


        // INR_BALANCES update
        INR_BALANCES[userId].balance -= quantity*price;
        INR_BALANCES[sellerUserId].balance += quantity*price;
        INR_BALANCES[sellerUserId].locked -= quantity*price;
  
        // STOCK_BALANCES update
        STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
        STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

        // ORDERBOOK update
        quantity = 0;

        return sellOrder;
      } else {
        console.log('to you man 2');
        console.log('quantity:- ', typeof quantity, "sellerQuantity:- ", typeof sellerQuantity);
        quantity = quantity - sellerQuantity;
        console.log('quantity:- ', quantity, "sellerQuantity:- ", sellerQuantity);


        // INR_BALANCES update
        console.log('checkinngggg:- ', INR_BALANCES)
        INR_BALANCES[userId].balance -= sellerQuantity*price;
        console.log('w11111')

        INR_BALANCES[sellerUserId].balance += sellerQuantity*price;
        console.log('w111112222')

        INR_BALANCES[sellerUserId].locked -= sellerQuantity*price;
        console.log('w111113333333')

        
        console.log("CP4.5:-  ",'user id:- ', userId, 'stockSymbol:- ', stockSymbol, 'quantitty:- ', quantity, "price:- ", price);

        console.log(STOCK_BALANCES[userId])
        // STOCK_BALANCES update
        if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
          STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
        } else {
          STOCK_BALANCES[userId][stockSymbol] = {quantity: sellerQuantity};
        }
        STOCK_BALANCES[sellerUserId][stockSymbol].quantity -= sellerQuantity;

        return undefined;
      }
    }
  })

  console.log('Yes trackerrr:- ', YES_TRACKER);
  console.log("CP4.5:-  ",'user id:- ', userId, 'stockSymbol:- ', stockSymbol, 'quantitty:- ', quantity, "price:- ", price);

  YES_TRACKER[stockSymbol][1] = YES_TRACKER[stockSymbol][1].filter((sellOrder, _) => {
    console.log('check self order:- ', sellOrder)
    return sellOrder !== undefined
  })

  console.log('yyyy:-', YES_TRACKER)

  console.log("CP5:-  ",'user id:- ', userId, 'stockSymbol:- ', stockSymbol, 'quantitty:- ', quantity, "price:- ", price);


  console.log("lastttt:- ", INR_BALANCES);

  if (quantity === 0) {
    res.status(200).json({ message: "Buy order placed and trade executed" })
  } else {
    res.status(200).json({ message: "Buy order placed and pending" })
  }
});

// Place Sell Order for yes
app.post("/order/sell/yes", (req, res) => {
  let {userId, stockSymbol, quantity, price} = req.body;

  const userBalance = INR_BALANCES[userId].balance;

  if (!YES_TRACKER.hasOwnProperty(stockSymbol)) {
    YES_TRACKER[stockSymbol] = [[], []];
    YES_TRACKER[stockSymbol][1].push({userId: userId, quantity: quantity, price: price});


    console.log('balance before update:- ', INR_BALANCES)
    // INR_BALANCES update
    INR_BALANCES[userId].locked += quantity*price;
    
    // STOCK_BALANCES update
    if (STOCK_BALANCES[userId].hasOwnProperty(stockSymbol)) {
      STOCK_BALANCES[userId][stockSymbol]['yes'] = {
        quantity: 0,
        locked: quantity
      }
    } else {
      STOCK_BALANCES[userId][stockSymbol] = {'yes': {
        quantity: 0,
        locked: quantity
      }}
    }

    // ORDERBOOK update
    res.status(200).json({ message: `Sell order placed for ${quantity} 'yes' options at price ${price}.` })
  }


  // CHECK IF MATCHING BUY ORDER
  YES_TRACKER[stockSymbol][0] = YES_TRACKER[stockSymbol][0].map((sellOrder, _) => {
    if (sellOrder.price === price) {

      console.log('yo mannnn')
      const {userId: sellerUserId, stockSymbol, quantity: sellerQuantity, price} = sellOrder;

      if (sellOrder.quantity > quantity) {
        sellOrder.quantity -= quantity;

        // INR_BALANCES update
        INR_BALANCES[userId].balance -= quantity*price;
        INR_BALANCES[sellerUserId].balance += quantity*price;
        INR_BALANCES[sellerUserId].locked -= quantity*price;
  
        // STOCK_BALANCES update
        STOCK_BALANCES[userId][stockSymbol].quantity += quantity;
        STOCK_BALANCES[sellerUserId][stockSymbol].locked -= quantity;

        // ORDERBOOK update

        quantity = 0;

        return sellOrder;
      } else {
        quantity -= sellerQuantity;

        // INR_BALANCES update
        INR_BALANCES[userId].balance -= sellerQuantity*price;
        INR_BALANCES[sellerUserId].balance += sellerQuantity*price;
        INR_BALANCES[sellerUserId].locked -= sellerQuantity*price;
  
        // STOCK_BALANCES update
        STOCK_BALANCES[userId][stockSymbol].quantity += sellerQuantity;
        STOCK_BALANCES[sellerUserId][stockSymbol].locked -= sellerQuantity;

        return undefined;
      }
    }
  })

  YES_TRACKER[stockSymbol][0] = YES_TRACKER[stockSymbol][0].filter((sellOrder, _) => {
    return sellOrder !== undefined
  })

  if (quantity === 0) {
    res.status(200).json({ message: `Sell order matched at price ${price}` })
  } else {
    res.status(200).json({ message: "Sell order placed and pending" })
  }

});

// Buy the no stock
app.post("/order/buy/no", (req, res) => {

});

// Place Sell Order for no
app.post("/order/sell/no", (req, res) => {
  
});

// View orderbook
app.get("/orderbook/:stockSymbol", (req, res) => {
  const stockSymbol = req.params.stockSymbol;

  if (!ORDERBOOK.hasOwnProperty(stockSymbol)) {
    res.send("Stock not found!")
  }

  res.send(ORDERBOOK[stockSymbol])
});

// Mint fresh tokens
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app 