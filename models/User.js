import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import artisanProfileSchema from './subdocs/ArtisanProfile.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public/32",
  },
  artisanProfile: artisanProfileSchema,
  verificationToken: String,
  verificationTokenExpires: Date,
  role: { type: String, enum: ['user', 'artisan', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// 📦 Indexing for geospatial search
userSchema.index({ 'artisanProfile.coordinates': '2dsphere' });

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// 🔍 Password check
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🧼 Hide sensitive fields in JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.verificationToken;
    delete ret.verificationTokenExpires;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
