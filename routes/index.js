const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Simple auth middleware to protect routes
function ensureLoggedIn(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Home page (public)
router.get('/', (req, res) => {
  res.render('index', { title: 'Ontario Tech Casino' });
});

// Login page (public)
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Register page (public)
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Feature / dashboard page (PROTECTED)
router.get('/feature', ensureLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/login');

    // keep wallet value in the session for convenience
    req.session.wallet = user.wallet;

    res.render('feature', {
      title: 'OnTech Casino Game Menu',
      wallet: user.wallet
    });
  } catch (err) {
    console.error('Error loading feature page:', err);
    res.status(500).send('Server error loading feature page');
  }
});

// Deposit page (PROTECTED)
router.get('/deposit', ensureLoggedIn, (req, res) => {
  res.render('deposit', { title: 'Deposit Funds' });
});

// Withdraw page (PROTECTED)
router.get('/withdraw', ensureLoggedIn, (req, res) => {
  res.render('withdraw', { title: 'Withdraw Winnings' });
});

// Contact page (public GET)
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us', success: false });
});

// Handle Contact form (POST)
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // For this project we just log the message.
  // In a real application we might save this to MongoDB or send an email.
  console.log('Contact form submitted:', { name, email, message });

  res.render('contact', {
    title: 'Contact Us',
    success: true
  });
});

module.exports = router;
