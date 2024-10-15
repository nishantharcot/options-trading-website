import express from "express";
import userRoutes from "./routes/userRoutes.js";
import symbolRoutes from "./routes/symbolRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import otherRoutes from "./routes/otherRoutes.js"

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/symbol", symbolRoutes);
app.use("/order", orderRoutes);
app.use("/balances", balanceRoutes);
app.use('/', otherRoutes);

export default app;
