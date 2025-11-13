var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Ontario Tech Casino' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.get('/feature', (req, res) => {
  res.render('feature', { title: 'OnTech Casino Game Menu', wallet: 0  /* placeholder until MongoDB is connected */ });
});

router.get('/deposit', (req, res) => {
  res.render('deposit', { title: 'Deposit Funds' });
});

router.get("/withdraw", (req, res) => {
    res.render("withdraw", { title: 'Withdraw Winnings'});
});


module.exports = router;

