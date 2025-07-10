// models/subdocs/ArtisanProfile.js
import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
  bio: { type: String },
  category: { type: String },
  skills: [{ type: String }],
  yearsOfExperience: { type: Number },
  location: { type: String },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },
  available: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
}, { _id: false }); // ⬅ prevents generating _id for subdoc

export default artisanProfileSchema;
