import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String }, // optional
  icon: { type: String },        // optional
}, { timestamps: true });

// Normalize slug and name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }

  if (this.isModified('slug')) {
    this.slug = this.slug.trim().toLowerCase().replace(/\s+/g, '-');
  }

  next();
});

export default mongoose.model('Category', categorySchema);
