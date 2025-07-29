// routes/messageRoutes.js
import express from "express";
import Message from "../models/Message.js";
const router = express.Router();


// Fetch messages for a room
router.get('/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
});

export default router