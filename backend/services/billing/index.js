import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import router from "./routes/billing.routes.js";

dotenv.config();

const port = process.env.PORT;

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));//logs request in terminal

// Routes
app.use("/", router);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Billing Service Running",
  });
});

// Start server
app.listen(port, () => {
  connectDB();

  console.log(`Billing service running on ${port}`);
});
