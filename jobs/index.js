import { Queue, Worker } from 'bullmq';
import { redis } from '../utils/redis.js';
import { sendVerificationEmail, sendResetEmail } from '../utils/sendEmails.js';
import geocodeNewAddress from '../utils/geocoder.js';
import logger from '../utils/logger.js';

const connection = {
  host: redis.options.host,
  port: redis.options.port,
  password: redis.options.password,
  tls: redis.options.tls ? {} : undefined,
  maxRetriesPerRequest: null,
};

const emailQueue = new Queue('email', { connection });
const geoQueue   = new Queue('geo',   { connection });

// email worker
new Worker('email', async (job) => {
  const { type, to, token } = job.data;
  if (type === 'verify') await sendVerificationEmail(to, token);
  if (type === 'reset')  await sendResetEmail(to, token);
}, { connection });

// geocode worker
new Worker('geo', async (job) => {
  const { address, userId } = job.data;
  const coords = await geocodeNewAddress(address);
  logger.info(`Geocoded ${address}`, { userId, coords });
}, { connection });

export { emailQueue, geoQueue };