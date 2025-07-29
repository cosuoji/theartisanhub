// models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Artisan user
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reviewer
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: { type: String },
  images: [{ type: String }], // URLs from ImageKit

}, { timestamps: true });

reviewSchema.index({ artisan: 1, user: 1 }, { unique: true }); // 1 review per user per artisan

export default mongoose.model('Review', reviewSchema);
