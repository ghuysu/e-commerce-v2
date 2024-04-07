"use strict";

const redis = require("redis");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");

const redisClient = redis.createClient({
  url: "redis://your-redis-host:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("end", () => {
  console.log("Redis client disconnected");
});

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    try {
        const result = await redisClient.setNX(key, expireTime);
        
        if (result === 1) {
            console.log("///////////////////////////////////////////////////////")
            const isRevervation = await reservationInventory({
            productId,
            quantity,
            cartId,
            });

            console.log({ isReservation: isRevervation });

            if (isRevervation.modifiedCount) {
            await redisClient.pExpire(key, expireTime);
            return key;
            }

            return null;
      } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (err) {
        console.error("Error acquiring lock:", err);
        return null;
    }
  }
};

const releaseLock = async (keyLock) => {
  return redisClient.del(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
