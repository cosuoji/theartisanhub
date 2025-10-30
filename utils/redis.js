// import Redis from "ioredis";
// import dotenv from "dotenv";

// dotenv.config();

// export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
//   reconnectOnError: (err) => {
//     console.error("Redis reconnectOnError:", err);
//     return true; // always attempt to reconnect
//   },
//   maxRetriesPerRequest: null, // prevent errors when retry limit is hit
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 100, 2000);
//     return delay;
//   },
// });

// redis.on("error", (err) => {
//   console.error("[Redis] Connection error:", err);
// });

// redis.on("connect", () => {
//   console.log("[Redis] Connected");
// });

// redis.on("reconnecting", () => {
//   console.log("[Redis] Reconnecting...");
// });
