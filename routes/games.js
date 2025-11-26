var express = require("express");
var router = express.Router();

// ===============
// CARD SYSTEM
// ===============

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

router.get("/blackjack", (req, res) => {
    const deck = createDeck();

    const playerCards = [drawCard(deck), drawCard(deck)];
    const dealerCards = [drawCard(deck), drawCard(deck)];

    res.render("games/blackjack", {
        title: "Blackjack",
        playerCards: playerCards,
        dealerCards: dealerCards,
        playerTotal: null,
        dealerTotal: null
    });
});

/* RIDE THE BUS GAME PAGE 
router.get("/ridethebus", (req, res) => {
    res.render("games/ridethebus", {
      title: "Ride the Bus" 
    });
});
*/
/* -------------------------------
   RIDE THE BUS — BACKEND LOGIC
--------------------------------*/

// Start or reset the game
router.get("/ridethebus", (req, res) => {
  // Create fresh deck + draw first card
  const deck = createDeck();
  const firstCard = drawCard(deck);

  req.session.rtb = {
    deck: deck,
    cards: [firstCard],
    step: 1,
    multiplier: 1
  };

  res.render("games/ridethebus", {
      title: "Ride the Bus" 
    });
});

// Make a guess
router.post("/ridethebus/guess", (req, res) => {
  if (!req.session.rtb) {
    return res.status(400).json({ error: "Game not started." });
  }

  const game = req.session.rtb;
  const guess = req.body.guess; // e.g. "Red" / "Higher" / "Inside" / "♠"

  // Draw new card
  const newCard = drawCard(game.deck);
  game.cards.push(newCard);

  const prev = game.cards[game.cards.length - 2];  // previous card
  const cur = newCard;        // current card
  let correct = false;

  // STEP 1 — Red/Black
  if (game.step === 1) {
    if (guess === "Red" && cur.color === "red") correct = true;
    if (guess === "Black" && cur.color === "black") correct = true;

    if (correct) game.multiplier = 2;
  }

  // STEP 2 — Higher/Lower
  else if (game.step === 2) {
    if (guess === "Higher" && cur.value >= prev.value) correct = true;
    if (guess === "Lower" && cur.value <= prev.value) correct = true;

    if (correct) game.multiplier = 3;
  }

  // STEP 3 — Inside/Outside
  else if (game.step === 3) {
    const low = Math.min(prev.value, cur.value);
    const high = Math.max(prev.value, cur.value);
    const newVal = cur.value;

    if (guess === "Inside" && newVal >= low && newVal <= high) correct = true;
    if (guess === "Outside" && (newVal <= low || newVal >= high)) correct = true;

    if (correct) game.multiplier = 4;
  }

  // STEP 4 — Suit
  else if (game.step === 4) {
    if (guess === cur.suitHtml || guess === cur.suit) correct = true;
    if (correct) game.multiplier = 20;
  }

  // Update step
  if (correct) {
    game.step++;
  } else {
    // Lose — reset everything but show result
    req.session.rtb = null;
    return res.json({
      correct: false,
      card: cur,
      message: "Wrong! You fell off the bus!",
      multiplier: 0,
      gameOver: true
    });
  }

  // Win all steps
  if (game.step > 4) {
    const winnings = game.multiplier;

    req.session.rtb = null; // clear game but keep wallet session

    return res.json({
      correct: true,
      card: cur,
      message: "You completed the bus!",
      multiplier: winnings,
      gameOver: true
    });
  }

  // Continue game
  return res.json({
    correct: true,
    card: cur,
    step: game.step,
    multiplier: game.multiplier
  });
});



module.exports = router;