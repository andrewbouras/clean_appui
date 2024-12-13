const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const setupGoogleStrategy = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    image: profile.photos[0].value
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    email: user.email,
                    name: user.name
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Attach token to user object
            user.token = token;
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

module.exports = { setupGoogleStrategy };