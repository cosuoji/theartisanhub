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
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },

  comment: { type: String },

}, { timestamps: true });

reviewSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
