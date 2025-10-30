// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import morgan from 'morgan';
import helmet from 'helmet';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import { imagekit } from './utils/imagekit.js';


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
import messageRoutes from "./routes/messageRoutes.js"




dotenv.config();
const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://deft-pasca-0b4ec2.netlify.app'
];


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
app.use("/api/messages", messageRoutes)


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


const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // wrap Express

//  const io = new Server(server, {
//    cors: {
//      origin: allowedOrigins,
//      credentials: true,
//    },
//  });

//  io.on('connection', (socket) => {
//    console.log(`👋 Socket connected: ${socket.id}`);

//    // join room
//    socket.on('join-room', (roomId) => socket.join(roomId));

//  socket.on('send-message', async ({ room, sender, text }) => {
//   try {
//     const msg = new Message({ room, sender, text, type: 'text' });
//     await msg.save();
//     io.to(room).emit('new-message', msg);
//     //console.log(`Message sent to room ${room}:`, msg); // Debugging log
//   } catch (error) {
//     console.error('Error saving message:', error);
//   }
// });

//    // image
//    socket.on('upload-image', async ({ room, sender, file }) => {
//      const uploaded = await imagekit.upload({
//        file: Buffer.from(file, 'base64'),
//        fileName: `chat-${Date.now()}.jpg`,
//        folder: 'chat',
//      });
//      const msg = new Message({ room, sender, imageUrl: uploaded.url, type: 'image' });
//      await msg.save();
//      io.to(room).emit('new-message', msg);
//    });

//    socket.on('disconnect', () => console.log(`❌ Socket ${socket.id} disconnected`));
//  });

 connectDB();

server.listen(PORT, () => {
  logger.info("Server is running on http://localhost:" + PORT);
  
});