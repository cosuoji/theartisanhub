import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g. "ikeja", "lekki"
  },
  state: {
    type: String,
    default: 'Lagos',
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  helpfulVotes: { type: Number, default: 0 },
}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' });

locationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim().toLowerCase();
  }
  if (this.isModified('state')) {
    this.state = this.state.trim();
  }
  next();
});

export default mongoose.model('Location', locationSchema);
