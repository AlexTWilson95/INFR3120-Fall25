const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Deposit route
router.post("/deposit", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/login");

    user.wallet += amount;
    await user.save();

    // Update session wallet
    req.session.wallet = user.wallet;

    res.redirect("/feature");  
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error processing deposit");
  }
});

// Withdraw route
router.post("/withdraw", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/login");

    // Check if enough balance
    if (amount > user.wallet) {
      return res.redirect("/withdraw?error=1");
    }

    user.wallet -= amount;
    await user.save();

    req.session.wallet = user.wallet;

    res.redirect("/withdraw?success=1");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error processing withdrawal");
  }
});

module.exports = router;
