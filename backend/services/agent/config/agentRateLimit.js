// Ek user ek particular AI agent ko ek minute mein kitni baar use kar sakta hai, usko limit karna

import redis from "../../../shared/redis/redis.js";



const LIMITS = {
  chat: 20,//20 requests per minute
  coding: 5,
  pdf: 5,
  ppt: 5,
  image: 3,
  search:5
};

export const checkAgentLimit = async (userId, agent) => {

  const max = LIMITS[agent] ?? LIMITS.chat;

  //redis key banti hai
  const key = `rate:${agent}:${userId}`;//particular user ke liye particular agent

  const count = await redis.incr(key);// increment the integer value of key

  if (count === 1) {
    await redis.expire(key, 60);//60 seconds baad key automatically delete ho jaayegi
  }

  const ttl = await redis.ttl(key);//time to live if 42 sec means 42 sec remaining

  if (count > max) {

    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    const time =
      minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    const error = new Error(
      `Rate limit exceeded for ${agent}.`
    );

    error.status = 429;//too many requests

    error.data = {
      success: false,
      agent,
      limit: max,
      remainingTime: ttl,
      retryAfter: time,
      message: `You have reached the ${agent} limit (${max} requests/minute). Try again in ${time}.`
    };

    throw error;
  }

  return {
    remaining: max - count,
    limit: max
  };
};
