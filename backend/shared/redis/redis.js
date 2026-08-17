import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis Connected");
});

export default redis;

// Redis ek separate server hai — bilkul MongoDB jaisa ek alag database server hota hai
// redis and db dono storage hai

//ye file redis se connect kar rhi hai
