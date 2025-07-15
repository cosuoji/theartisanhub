import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
  bio: { type: String },
  skills: [{ type: String }],
  yearsOfExperience: { type: Number },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  address:{ type: String },

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

  available: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },

  // ✅ New field
  portfolioImages: [{ type: String }], // store URLs here
}, { _id: false });


export default artisanProfileSchema;
