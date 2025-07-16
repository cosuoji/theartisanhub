import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import Job from '../../models/Job.js';
import Review from '../../models/Review.js';
import Location from '../../models/Location.js';

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const hash = '$2b$10$TzE0GgU0LmAIY9d.Yrnp1uqOPxhu8XLOeHnYt9Hx5AP4uO0nhRX2S'; // 'password123'

const skills = ['plumbing', 'electrical', 'carpentry', 'painting', 'tiling', 'gardening'];

const streetNames = [
  "Herbert Macaulay Rd", "Ikorodu Rd", "Awolowo Rd", "Adeniran Ogunsanya St", "Bode Thomas St",
  "Allen Avenue", "Mobolaji Bank Anthony Way", "Broad Street", "Ojuelegba Rd", "Oba Akran Ave"
];

// utils/capitalizeWords.js
export const capitalizeWords = (str) =>
  str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const seed = async () => {
  try {
    await User.deleteMany();
    await Job.deleteMany();
    await Review.deleteMany();

    const users = [];
    const artisans = [];

    for (let i = 0; i < 40; i++) {
      users.push(await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hash,
        role: 'user',
        isVerified: true,
      }));
    }

    const locations = await Location.find({ isActive: true });
    if (!locations.length) throw new Error('No active locations found.');
    
    for (let i = 0; i < 40; i++) {
      const randomLocation = faker.helpers.arrayElement(locations);
      const randomStreet = faker.helpers.arrayElement(streetNames);
      const houseNumber = faker.number.int({ min: 1, max: 200 });
    
      // Optional scatter logic
      const offset = () => (Math.random() - 0.5) * 0.01;
      const [lng, lat] = randomLocation.coordinates.coordinates;
    
      artisans.push(await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hash,
        role: 'artisan',
        isVerified: true,
        artisanProfile: {
          bio: faker.lorem.paragraph(),
          skills: faker.helpers.arrayElements(skills, 3),
          yearsOfExperience: faker.number.int({ min: 1, max: 10 }),
          available: true,
          totalJobsCompleted: faker.number.int({ min: 0, max: 20 }),
          rating: faker.number.float({ min: 2, max: 5, precision: 0.1 }),
          totalReviews: faker.number.int({ min: 0, max: 15 }),
          address: `${houseNumber} ${randomStreet}, ${randomLocation.name}, Lagos`,
          location: randomLocation._id,
          coordinates: {
            type: 'Point',
            coordinates: [lng + offset(), lat + offset()],
          }
        }
      }));
    }
    
    
    for (let i = 0; i < 10; i++) {
      await Job.create({
        user: faker.helpers.arrayElement(users)._id,
        artisan: faker.helpers.arrayElement(artisans)._id,
        description: faker.lorem.sentence(),
        status: 'completed',
      });
    }

    for (let i = 0; i < 10; i++) {
      await Review.create({
        user: faker.helpers.arrayElement(users)._id,
        artisan: faker.helpers.arrayElement(artisans)._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      });
    }

    console.log('🌱 Dev data seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
