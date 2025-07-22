import { redis } from './redis.js';

export const cacheGet = async (key) => {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
};

export const cacheSet = async (key, data, ttl = 300) => {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
};

export const cacheDel = async (key) => redis.del(key);