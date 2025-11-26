var express = require("express");
var router = express.Router();
const User = require("../models/user");

// ===================
// CARD SYSTEM
// ===================
const suits = [
  { symbol: "♠", html: "&spades;", color: "black" },
  { symbol: "♣", html: "&clubs;", color: "black" },
  { symbol: "♥", html: "&hearts;", color: "red" },
  { symbol: "♦", html: "&diams;", color: "red" }
];

const ranks = [
  { rank: "A", value: 11 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "K", value: 10 }
];

function createDeck() {
  const deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        rank: rank.rank,
        value: rank.value,
        suit: suit.symbol,
        suitHtml: suit.html,
        color: suit.color
      });
    });
  });
  return deck;
}

function drawCard(deck) {
  const index = Math.floor(Math.random() * deck.length);
  return deck.splice(index, 1)[0];
}

// ==================================
// START GAME
// ==================================
router.get("/ridethebus", (req, res) => {
  const deck = createDeck();
  const first = drawCard(deck);

  req.session.rtb = {
    deck: deck,
    previousCard: first,
    step: 1,
    multiplier: 1,
    bet: 0
  };

  res.render("games/ridethebus", { title: "Ride the Bus" });
});

// ==================================
// PLACE BET
// ==================================
router.post("/ridethebus/bet", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: "Not logged in." });
  }

  const user = await User.findById(req.session.userId);
  const bet = Number(req.body.bet);

  if (bet > user.wallet) {
    return res.json({ success: false, message: "Not enough funds." });
  }

  user.wallet -= bet;
  await user.save();

  req.session.rtb.bet = bet;
  req.session.wallet = user.wallet;

  res.json({ success: true });
});

// ==================================
// MAKE A GUESS
// ==================================
router.post("/ridethebus/guess", async (req, res) => {
  const game = req.session.rtb;
  if (!game) return res.json({ error: "No game." });

  const guess = req.body.guess;
  const prev = game.previousCard;
  const cur = drawCard(game.deck);

  game.previousCard = cur;
  let correct = false;

  // STEP 1 — Red / Black
  if (game.step === 1) {
    if (guess.toLowerCase() === "red" && cur.color === "red") correct = true;
    if (guess.toLowerCase() === "black" && cur.color === "black") correct = true;
    if (correct) game.multiplier = 2;
  }

  // STEP 2 — Higher / Lower
  else if (game.step === 2) {
    if (guess.toLowerCase() === "higher" && cur.value > prev.value) correct = true;
    if (guess.toLowerCase() === "lower" && cur.value < prev.value) correct = true;
    if (correct) game.multiplier = 3;
  }

  // STEP 3 — Inside / Outside
  else if (game.step === 3) {
    let low = Math.min(prev.value, cur.value);
    let high = Math.max(prev.value, cur.value);

    if (guess.toLowerCase() === "inside" && cur.value > low && cur.value < high) correct = true;
    if (guess.toLowerCase() === "outside" && (cur.value < low || cur.value > high)) correct = true;

    if (correct) game.multiplier = 4;
  }

  // STEP 4 — Suit
  else if (game.step === 4) {
    if (guess === cur.suitHtml || guess === cur.suit) correct = true;
    if (correct) game.multiplier = 20;
  }

  // -----------------------------------
  // WRONG GUESS
  // -----------------------------------
  if (!correct) {
    req.session.rtb = null;

    return res.json({
      correct: false,
      card: cur,
      message: `Wrong! You lost $${game.bet}.`,
      multiplier: 0,
      gameOver: true
    });
  }

  // -----------------------------------
  // NEXT STEP
  // -----------------------------------
  game.step++;

  // WIN THE GAME
  if (game.step > 4) {
    const user = await User.findById(req.session.userId);
    const winnings = game.bet * game.multiplier;

    user.wallet += winnings;
    await user.save();

    req.session.wallet = user.wallet;
    req.session.rtb = null;

    return res.json({
      correct: true,
      card: cur,
      message: `You won $${winnings}!`,
      multiplier: game.multiplier,
      gameOver: true
    });
  }

  // CONTINUE GAME
  return res.json({
    correct: true,
    card: cur,
    step: game.step,
    multiplier: game.multiplier
  });
});

// ==================================
// CASH OUT (FIXED)
// ==================================
router.post("/ridethebus/cashout", async (req, res) => {
  const game = req.session.rtb;
  if (!game) return res.json({ message: "No game.", gameOver: true });

  const user = await User.findById(req.session.userId);

  let m = game.multiplier;
  if (!m || m < 1) m = 1;

  const winnings = game.bet * m;

  user.wallet += winnings;
  await user.save();

  req.session.wallet = user.wallet;
  req.session.rtb = null;

  return res.json({
    correct: true,
    gameOver: true,
    card: game.previousCard,
    multiplier: m,
    message: `You cashed out and won $${winnings}!`
  });
});

module.exports = router;
