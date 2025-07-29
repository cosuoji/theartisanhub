// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import morgan from 'morgan';
import helmet from 'helmet';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';
//import * as Sentry from '@sentry/node';
import logger from './utils/logger.js';


// 🌍 Route imports
 import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import artisanRoutes from './routes/artisanRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import reviewRoutes from './routes/reviewRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from "./routes/adminRoutes.js"
import { healthCheck } from './controllers/healthController.js';
import referralRoutes from "./routes/referralRoutes.js"




dotenv.config();
const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://deft-pasca-0b4ec2.netlify.app'
];

//const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Explicitly allow OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// if (process.env.NODE_ENV === 'production') {
//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,
//     tracesSampleRate: 1.0,
//   });
//   app.use(Sentry.Handlers.requestHandler());
//   app.use(Sentry.Handlers.tracingHandler());
// }

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}




app.use(express.json());
app.use(cookieParser());

// Sample route
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/referral", referralRoutes)


app.get('/test-cookies', (req, res) => {
  res.json({ cookies: req.cookies });
});


app.get('/debug-cookie', (req, res) => {
  res.cookie('testCookie', 'hello', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  res.send('Cookie set');
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health endpoint (no auth)
app.get('/api/health', healthCheck);

// ⚠️ Error Handlers
app.use(notFound);
app.use(errorHandler);

// if (process.env.NODE_ENV === 'production') {
//   app.use(Sentry.Handlers.errorHandler());
// }
// process.on('uncaughtException', (err) => {
//   logger.error('Uncaught Exception', err);
//   process.exit(1);
// });
// process.on('unhandledRejection', (reason) => {
//   logger.error('Unhandled Rejection', reason);
//   process.exit(1);
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	logger.info("Server is running on http://localhost:" + PORT);
	connectDB();
});

//  if (process.env.NODE_ENV !== 'test') {
//   app.listen(PORT, () => console.log(`Server on ${PORT}`));
//   connectDB();
//  }
//  export default app;
