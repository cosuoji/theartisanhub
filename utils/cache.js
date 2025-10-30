// import { redis } from './redis.js';

// export const cacheGet = async (key) => {
//   const val = await redis.get(key);
//   return val ? JSON.parse(val) : null;
// };

// export const cacheSet = async (key, data, ttl = 300) => {
//   await redis.set(key, JSON.stringify(data), 'EX', ttl);
// };

// export const cacheDel = async (key) => redis.del(key);

// // utils/cache.js  (next to cacheGet / cacheSet)
// export const cacheDelPattern = async (pattern) => {
//   // SCAN + DEL to avoid blocking Redis
//   const stream = redis.scanStream({ match: pattern });
//   stream.on('data', (keys) => {
//     if (keys.length) {
//       redis.unlink(keys); // faster non-blocking delete
//     }
//   });
//   await new Promise((res) => stream.on('end', res));
// };