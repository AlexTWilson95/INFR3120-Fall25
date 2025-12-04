# Ontario Tech Casino – INFR3120 Final Project (Part III)

This repository contains our INFR3120 final project, **Ontario Tech Casino**.

---

## Link to live demo
link: available later

---

## about

It is a small casino-style web app where users can:

- Register and log in
- Deposit and withdraw **fake** money into a wallet
- Play games such as **Ride The Bus** and **Blackjack**
- Navigate through a simple dashboard / feature page
- Contact the “team” via a Contact Us form

---

## Tech Stack
The tech stack is:

- **Node.js + Express** for the server
- **EJS** templates for the views
- **MongoDB Atlas** + Mongoose for storing users and wallet balances
- **express-session** for authentication
- Deployed using a cloud provider as required for the course

---

## How to Run the Project Locally

1. Clone the repo:

   ```bash
   git clone <repo-url>
   cd INFR3120-Fall25-main


---

## notes on commit history and why it might look unusual 

This is a first time collaboration using github and the commits are not accurate.
---
At november 13/25 when I commited all these (index page, header and footer, register, and css) with no changes because I commited them earlier on in the day (hours before). But when Alex did his next commit it delted all of my old ones. So i re-commited them with no changes but they still show up as a commit under my name (so you know what work i did).

---
## Project Structure

Ontario Tech casino/
├── app.js                      # Main Express application
├── package.json                # Dependencies & scripts
├── package-lock.json
├── .env                        # Environment variables
├── .gitignore

├── bin/
│   └── www                     # Server startup script

├── models/
│   ├── user.js                 # User schema (username, password, wallet)
│   └── transaction.js          

├── routes/
│   ├── index.js                # Home page + feature dashboard
│   ├── auth.js                 # Register, login, logout, session handling
│   ├── games.js                # Blackjack + Ride the Bus backend logic
│   ├── wallet.js               # Deposit + Withdraw
│   └── users.js                

├── views/
│   ├── partials/
│   │   ├── header.ejs          # Navigation bar (dynamic when logged in)
│   │   └── footer.ejs
│   │
│   ├── index.ejs               # Public landing page
│   ├── login.ejs               # Login form
│   ├── register.ejs            # Create new account
│   ├── feature.ejs             # Logged-in game menu
│   ├── deposit.ejs             # Fake deposit UI
│   ├── withdraw.ejs            # Wallet withdrawal UI
│   │
│   └── games/
│       ├── blackjack.ejs       # Blackjack game UI
│       └── ridethebus.ejs      # Ride the Bus game UI

├── public/
│   ├── css/
│   │   └── style.css           # Full casino theme
│   │
│   ├── javascript/             
│   │
│   └── images/                 

└── README.md                   # Project documentation


---

## Authors 
- Alexander Wilson - Student
- Ethan Baird - Student
- Mujahid Marwan Abdulkarim - Student




