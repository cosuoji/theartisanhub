import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
  bio: { type: String },
  skills: [{ type: String }],
  yearsOfExperience: { type: Number },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  address:{ type: String,  maxlength: 255},

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
  rating: {type: Number, default: 0},
availabilitySlots: [{
  start: { type: Date, required: true },
   end:   { type: Date, required: true }
}],

  // ✅ New field
  portfolioImages: [{ type: String }], // store URLs here
  isCurrentlyFeatured: {type: Boolean, default: false},
  featuredUntil: { type: Date, default: null }, // null = not currently featured

}, { _id: false });


export default artisanProfileSchema;

