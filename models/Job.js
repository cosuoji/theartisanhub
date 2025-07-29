// models/Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  location: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

jobSchema.index({ user: 1, artisan: 1 });
jobSchema.index({ status: 1 });

export default mongoose.model('Job', jobSchema);
