// models/Blacklist.js
import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// Automatically remove expired tokens using TTL index
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Blacklist", blacklistSchema);
