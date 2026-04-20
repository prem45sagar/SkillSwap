import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Explore from './models/Explore.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const seed = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not defined');

    await mongoose.connect(mongoURI);
    console.log('Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Explore.deleteMany({});
    
    // Clear legacy collections if they exist to prevent confusion
    try {
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.some(c => c.name === 'skills')) {
          await mongoose.connection.db.dropCollection('skills');
          console.log('Cleared legacy "skills" collection.');
        }
      }
    } catch (err) {
      console.warn('Could not clear legacy collections:', err.message);
    }

    // Create a demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      password: hashedPassword,
      bio: 'Full-stack developer with 5 years of experience in React and Node.js.',
      skills: []
    });

    const user2 = await User.create({
      name: 'Marcus Thorne',
      email: 'marcus@example.com',
      password: hashedPassword,
      bio: 'Digital nomad and professional photographer specializing in landscape shots.',
      skills: []
    });

    const user3 = await User.create({
      name: 'Elena Rodriguez',
      email: 'elena@example.com',
      password: hashedPassword,
      bio: 'Creative director and UI/UX designer. Passionate about minimalism.',
      skills: []
    });

    // Create skills
    const skills = [
      {
        name: 'Advanced React Architecture',
        description: 'Learn how to build scalable React apps with clean architecture and design patterns.',
        category: 'Development',
        owner: user1._id,
        location: 'San Francisco, CA',
        availability: 'Weekends'
      },
      {
         name: 'Node.js Performance Tuning',
         description: 'Master profiling and optimizing high-traffic Node.js applications.',
         category: 'Development',
         owner: user1._id,
         location: 'Remote',
         availability: 'Evenings'
      },
      {
        name: 'Cinematic Landscape Photography',
        description: 'Practical guide to lighting, composition, and post-processing for outdoor shots.',
        category: 'Lifestyle',
        owner: user2._id,
        location: 'London, UK',
        availability: 'Flexible'
      },
      {
        name: 'Minimalist UI Design',
        description: 'A deep dive into whitespace, typography, and color theory for modern interfaces.',
        category: 'Design',
        owner: user3._id,
        location: 'Madrid, Spain',
        availability: 'Mornings'
      },
      {
        name: 'Social Media Strategy',
        description: 'How to grow your brand presence and reach the right audience effectively.',
        category: 'Marketing',
        owner: user3._id,
        location: 'Remote',
        availability: 'Part-time'
      }
    ];

    const createdSkills = await Explore.insertMany(skills);

    // Link skills back to users (using Names instead of IDs to avoid the profile clutter issue)
    await User.findByIdAndUpdate(user1._id, { $push: { skills: { $each: [createdSkills[0].name, createdSkills[1].name] } } });
    await User.findByIdAndUpdate(user2._id, { $push: { skills: createdSkills[2].name } });
    await User.findByIdAndUpdate(user3._id, { $push: { skills: { $each: [createdSkills[3].name, createdSkills[4].name] } } });

    console.log('Seeding complete! Added 3 users and 5 skills.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
