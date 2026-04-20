import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile.emails[0].value);
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("No user with googleId, checking email...");
          // Check if user exists with same email but no googleId
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log("Existing user found by email, linking Google ID...");
            // Update existing user with googleId
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos[0].value;
            user.isVerified = true;
            await user.save();
          } else {
            console.log("Creating brand new Google user...");
            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos[0].value,
              isVerified: true,
            });
          }
        }
        
        console.log("Login successful for:", user.email);
        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
