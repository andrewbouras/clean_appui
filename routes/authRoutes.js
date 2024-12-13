const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Starting Google OAuth flow...');
  console.log('Query params:', req.query);
  console.log('Session:', req.session);
  
  // Store returnTo URL in session
  req.session.returnTo = req.query.returnTo || '/';
  console.log('Stored returnTo URL:', req.session.returnTo);
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: req.session.returnTo // Pass the returnTo URL as state
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    try {
      console.log('Google callback received');
      console.log('User:', req.user);
      console.log('Session:', req.session);

      if (!req.user || !req.user.token) {
        console.error('No user or token found in callback');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
      }

      // Set JWT token in HTTP-only cookie
      res.cookie('jwt', req.user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect to stored returnTo URL or root
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      console.log('Redirecting to:', `${process.env.FRONTEND_URL}${returnTo}`);
      res.redirect(`${process.env.FRONTEND_URL}${returnTo}`);
    } catch (error) {
      console.error('Callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  try {
    req.logout(() => {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Check auth status
router.get('/status', verifyToken, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});

module.exports = router;
