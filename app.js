require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const walletRouter = require("./routes/wallet");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Import routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const gamesRouter = require("./routes/games");
const authRouter = require("./routes/auth");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Use routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/games", gamesRouter);
app.use("/", authRouter);   // register + login routes
app.use("/wallet", walletRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

