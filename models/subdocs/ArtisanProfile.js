import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
  bio: { type: String },
  category: { type: String },
  skills: [{ type: String }],
  yearsOfExperience: { type: Number },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
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

  available: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },

  // ✅ New field
  portfolioImages: [{ type: String }], // store URLs here
}, { _id: false });


export default artisanProfileSchema;
