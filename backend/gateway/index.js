import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser"

import { protect } from "./middlewares/auth.middleware.js"
import { proxyWithUser } from "./utils/proxyWithHeader.js"
import { getCurrentUser } from "./controllers/user.controller.js"

import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import redis from "../shared/redis/redis.js"

dotenv.config()

const port = process.env.PORT || 5000;

const app = express();

app.use(cors({
    origin : "http://localhost:5173,
    credentials : true
}));

app.use(
  "/uploads",
  express.static("uploads")
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth",proxy(process.env.AUTH_SERVICE))
app.use("/api/me",protect,getCurrentUser)
app.use("/api/chat",protect,proxyWithUser(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,proxyWithUser(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithUser(process.env.BILLING_SERVICE))

app.get("/",(req,res)=>{
    res.status(200).json({
       service : "gateway",
       status : "ok"
    });
})

app.listen(port,()=>{
    console.log(`gateway started at  ${port}`);
})
