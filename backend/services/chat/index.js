import express from "express";
import dotenv from "dotenv";

import router from "./routes/chat.routes.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());

// Routes
app.use("/", router);

// Start server
app.listen(port, () => {
  connectDB();

  console.log(`Chat service running on port ${port}`);
});
