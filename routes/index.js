const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Ontario Tech Casino' });
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Feature / dashboard page
router.get('/feature', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/login');

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

// Deposit page
router.get('/deposit', (req, res) => {
  res.render('deposit', { title: 'Deposit Funds' });
});

// Withdraw page
router.get('/withdraw', (req, res) => {
  res.render('withdraw', { title: 'Withdraw Winnings' });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact');
});

module.exports = router;
