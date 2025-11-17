const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

// ---------- REGISTER (GET) ----------
router.get("/register", (req, res) => {
  res.render("register"); // views/register.ejs
});

// ---------- REGISTER (POST) ----------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).send("Username already exists.");
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashed,
      wallet: 1000, // starting balance
    });

    // On success, send them to login
    res.redirect("/login");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Error creating account.");
  }
});

// ---------- LOGIN (GET) ----------
router.get("/login", (req, res) => {
  res.render("login"); // views/login.ejs
});

// ---------- LOGIN (POST) ----------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("Invalid username or password.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send("Invalid username or password.");
    }

    // LOGIN SUCCESS
    // For this assignment, no sessions yet.
    // Just redirect to a page (e.g., feature/dashboard)
    res.redirect("/feature"); // or "/" if you prefer
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in.");
  }
});

module.exports = router;
