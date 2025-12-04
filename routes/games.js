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
// START GAME ride the bus
// ==================================
router.get("/ridethebus", (req, res) => {
  const deck = createDeck();
  const first = drawCard(deck);

  req.session.rtb = {
    deck: deck,
    cards: [first],   // array of all cards, start with ONE card
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
// MAKE A GUESS (NOW USING ARRAY LOGIC)
// ==================================
router.post("/ridethebus/guess", async (req, res) => {
  const game = req.session.rtb;
  if (!game) return res.json({ error: "No game." });

  const guess = req.body.guess.toLowerCase();

  // Draw new card for THIS step
  const newCard = drawCard(game.deck);
  game.cards.push(newCard);

  let correct = false;

  // ========= CARD REFERENCES BY INDEX ===========
  // cards[0] = before guessing
  // cards[1] = step 1 card
  // cards[2] = step 2 card
  // cards[3] = step 3 card
  // cards[4] = step 4 card

  // STEP 1 — Red / Black
  if (game.step === 1) {
    const c1 = game.cards[1];  // step 1 card

    if (guess === "red" && c1.color === "red") correct = true;
    if (guess === "black" && c1.color === "black") correct = true;

    if (correct) game.multiplier = 2;
  }

  // STEP 2 — Higher / Lower
  else if (game.step === 2) {
    const c0 = game.cards[0];
    const c1 = game.cards[1]; // the card drawn in step 1
    const c2 = game.cards[2]; // the new card for this step

    if (guess === "higher" && c2.value >= c1.value) correct = true;
    if (guess === "lower" && c2.value <= c1.value) correct = true;

    if (correct) game.multiplier = 3;
  }

  // STEP 3 — Inside / Outside
  else if (game.step === 3) {
    const c1 = game.cards[1];
    const c2 = game.cards[2];
    const c3 = game.cards[3];  // current card

    const low = Math.min(c1.value, c2.value);
    const high = Math.max(c1.value, c2.value);

    if (guess === "inside" && c3.value >= low && c3.value <= high) correct = true;
    if (guess === "outside" && (c3.value <= low || c3.value >= high)) correct = true;

    if (correct) game.multiplier = 4;
  }

  // STEP 4 — Suit
  else if (game.step === 4) {
    const c4 = game.cards[4];

    if (guess === c4.suitHtml.toLowerCase() || guess === c4.suit.toLowerCase()) {
        correct = true;
    }

    if (correct) game.multiplier = 20;
  }

  // -----------------------------------
  // WRONG GUESS
  // -----------------------------------
  if (!correct) {
    req.session.rtb = null;

    return res.json({
      correct: false,
      card: newCard,
      message: `Wrong! You lost $${game.bet}.`,
      multiplier: 0,
      gameOver: true
    });
  }

  // STEP SUCCESSFUL — GO TO NEXT
  game.step++;

  // -----------------------------------
  // COMPLETED ALL 4 STEPS
  // -----------------------------------
  if (game.step > 4) {
    const user = await User.findById(req.session.userId);
    const winnings = game.bet * game.multiplier;

    user.wallet += winnings;
    await user.save();

    req.session.wallet = user.wallet;
    req.session.rtb = null;

    return res.json({
      correct: true,
      card: newCard,
      message: `You won $${winnings}!`,
      multiplier: game.multiplier,
      gameOver: true
    });
  }

  // CONTINUE GAME
  return res.json({
    correct: true,
    card: newCard,
    step: game.step,
    multiplier: game.multiplier
  });
});

// ==================================
// CASH OUT (UNCHANGED)
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
    card: game.cards[game.cards.length - 1],
    multiplier: m,
    message: `You cashed out and won $${winnings}!`
  });
});


// =======================================
// BLACKJACK SYSTEM
// =======================================

// Calculate blackjack hand value (handles aces)
function calculateTotal(cards) {
  let total = cards.reduce((sum, c) => sum + c.value, 0);
  let aces = cards.filter(c => c.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10; // convert A from 11 → 1
    aces--;
  }
  return total;
}

// ---------------------------------------
// LOAD BLACKJACK PAGE 
// ---------------------------------------
router.get("/blackjack", (req, res) => {
  // clear previous blackjack session
  req.session.blackjack = null;

  res.render("games/blackjack", {
    title: "Blackjack",
    dealerCards: [],
    playerCards: [],
    dealerTotal: "??",
    playerTotal: "??"
  });
});

// ---------------------------------------
// PLACE BET → DEAL CARDS
// ---------------------------------------
router.post("/blackjack/bet", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: "Not logged in." });
  }

  const user = await User.findById(req.session.userId);
  const bet = Number(req.body.bet);

  if (bet > user.wallet) {
    return res.json({ success: false, message: "Not enough funds." });
  }

  // Deduct bet
  user.wallet -= bet;
  await user.save();
  req.session.wallet = user.wallet;

  // Create game session
  const deck = createDeck();
  const p1 = drawCard(deck);
  const p2 = drawCard(deck);
  const d1 = drawCard(deck);
  const d2 = drawCard(deck);

  req.session.blackjack = {
    deck,
    playerCards: [p1, p2],
    dealerCards: [d1, d2],
    bet,
    gameOver: false
  };

  res.json({
    success: true,
    message: `Bet placed: $${bet}`,
    playerCards: [p1, p2],
    dealerCards: [d1], // only reveal first dealer card
    playerTotal: calculateTotal([p1, p2]),
    dealerTotal: d1.value
  });
});

// ---------------------------------------
// HIT
// ---------------------------------------
router.post("/blackjack/hit", (req, res) => {
  const game = req.session.blackjack;
  if (!game) return res.json({ error: "Game not started." });

  const card = drawCard(game.deck);
  game.playerCards.push(card);

  const total = calculateTotal(game.playerCards);

  if (total > 21) {
    game.gameOver = true;
    return res.json({
      card,
      total,
      gameOver: true,
      winner: "dealer"
    });
  }

  res.json({
    card,
    total,
    gameOver: false
  });
});

// ---------------------------------------
// STAND → DEALER PLAYS
// ---------------------------------------
router.post("/blackjack/stand", async (req, res) => {
  const game = req.session.blackjack;
  if (!game) return res.json({ error: "Game not started." });

  let dealerTotal = calculateTotal(game.dealerCards);

  // Dealer draws until 17+
  while (dealerTotal < 17) {
    let newCard = drawCard(game.deck);
    game.dealerCards.push(newCard);
    dealerTotal = calculateTotal(game.dealerCards);
  }

  const playerTotal = calculateTotal(game.playerCards);

  // Determine winner
  let winner = "dealer";
  if (dealerTotal > 21 || playerTotal > dealerTotal) winner = "player";
  else if (dealerTotal === playerTotal) winner = "push";

  // payout
  const user = await User.findById(req.session.userId);
  if (winner === "player") user.wallet += game.bet * 2;
  else if (winner === "push") user.wallet += game.bet;
  await user.save();
  req.session.wallet = user.wallet;

  req.session.blackjack = null;

  res.json({
    dealerCards: game.dealerCards,
    dealerTotal,
    playerTotal,
    winner,
    bet: game.bet,
    payout: 
        winner === "player" ? game.bet * 2 :
        winner === "push" ? game.bet :
        0
  });
});

// ---------------------------------------
// RESTART
// ---------------------------------------
router.get("/blackjack/restart", (req, res) => {
  req.session.blackjack = null;
  res.redirect("/games/blackjack");
});




module.exports = router;
