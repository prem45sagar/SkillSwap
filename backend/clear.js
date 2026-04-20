import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Explore from './models/Explore.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const clear = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not defined');

    await mongoose.connect(mongoURI);
    console.log('Connected for database cleanup...');

    await User.deleteMany({});
    await Explore.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Database cleared successfully! All dummy data removed.');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

clear();
