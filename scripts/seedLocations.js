import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/Location.js';

dotenv.config();

const locations = [
  { name: "ikeja", coordinates: { type: "Point", coordinates: [3.3792, 6.6018] } },
  { name: "lekki", coordinates: { type: "Point", coordinates: [3.5312, 6.4421] } },
  { name: "victoria island", coordinates: { type: "Point", coordinates: [3.4205, 6.4281] } },
  { name: "yaba", coordinates: { type: "Point", coordinates: [3.3792, 6.5123] } },
  { name: "surulere", coordinates: { type: "Point", coordinates: [3.3619, 6.5004] } },
  { name: "ikorodu", coordinates: { type: "Point", coordinates: [3.5061, 6.6194] } },
  { name: "ajah", coordinates: { type: "Point", coordinates: [3.5854, 6.4670] } },
  { name: "agege", coordinates: { type: "Point", coordinates: [3.3265, 6.6210] } },
  { name: "mushin", coordinates: { type: "Point", coordinates: [3.3501, 6.5292] } },
  { name: "oshodi", coordinates: { type: "Point", coordinates: [3.3300, 6.5583] } },
  { name: "epe", coordinates: { type: "Point", coordinates: [3.9829, 6.5583] } },
  { name: "badagry", coordinates: { type: "Point", coordinates: [2.8854, 6.4172] } },
  { name: "ogba", coordinates: { type: "Point", coordinates: [3.3461, 6.6352] } },
  { name: "maryland", coordinates: { type: "Point", coordinates: [3.3762, 6.5617] } },
  { name: "festac", coordinates: { type: "Point", coordinates: [3.2994, 6.4654] } },
  { name: "gbagada", coordinates: { type: "Point", coordinates: [3.3892, 6.5510] } },
  { name: "magodo", coordinates: { type: "Point", coordinates: [3.3655, 6.6130] } },
  { name: "apapa", coordinates: { type: "Point", coordinates: [3.3672, 6.4483] } },
  { name: "ojota", coordinates: { type: "Point", coordinates: [3.3793, 6.5714] } },
  { name: "ketu", coordinates: { type: "Point", coordinates: [3.3935, 6.5862] } }
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Location.deleteMany(); // Optional: Clear old locations
    await Location.insertMany(locations);
    console.log('🌍 Lagos locations seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Failed to seed locations:', err.message);
    process.exit(1);
  }
};

seedLocations();
