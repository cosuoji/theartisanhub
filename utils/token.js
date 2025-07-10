import crypto from 'crypto';

export const generateHashedToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour

  return { raw, hashed, expires };
};
