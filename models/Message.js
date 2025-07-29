// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: String,                // "userId:artisanId"
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  imageUrl: String,
  type: { type: String, enum: ['text', 'image'], default: 'text' },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);