const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

// Import passport config
require('./config/passport');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(express.json({ limit: '700mb' }));
app.use(express.urlencoded({ limit: '700mb', extended: true }));
app.use(cookieParser(process.env.COOKIE_KEY));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://notesfront-ha2ry34daa-uc.a.run.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Prevent caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection established'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message, err.stack);
    process.exit(1);
  });

// Mount routes - only auth routes for now
app.use('/auth', require('./routes/authRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
server.timeout = 300000; // 5 minutes

module.exports = { app };




