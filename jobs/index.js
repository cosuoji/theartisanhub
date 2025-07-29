import { Queue, Worker } from 'bullmq';
import { redis } from '../utils/redis.js';
import { sendVerificationEmail, sendResetEmail } from '../utils/sendEmails.js';
import geocodeNewAddress from '../utils/geocoder.js';

const connection = {
  host: redis.options.host,
  port: redis.options.port,
  password: redis.options.password,
  tls: redis.options.tls ? {} : undefined,
  maxRetriesPerRequest: null,
};


// 1. Queues (used to enqueue jobs)
export const emailQueue = new Queue('email', { connection });
export const geoQueue   = new Queue('geo',   { connection });

// 2. In-process workers (run inside the web dyno)
new Worker('email', async (job) => {
  const { type, to, token } = job.data;
  if (type === 'verify') await sendVerificationEmail(to, token);
  if (type === 'reset')  await sendResetEmail(to, token);
}, { connection });

new Worker('geo', async (job) => {
  const { address, userId } = job.data;
  const coords = await geocodeNewAddress(address);
}, { connection });