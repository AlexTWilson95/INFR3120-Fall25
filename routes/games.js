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

module.exports = router;