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

## Project Folder Structure
```bash
   Ontario_Tech_Casino/
   ├── bin/
   │   └── www
   │
   ├── public/
   │   ├── css/
   │   │   └── style.css
   │   ├── javascript/
   │   │   └── main.js
   │   └── images/
   │       └── (site images)
   │
   ├── routes/
   │   ├── index.js
   │   ├── auth.js
   │   ├── games.js
   │   ├── wallet.js
   │   └── users.js
   │
   ├── models/
   │   ├── user.js
   │   └── transaction.js
   │
   ├── views/
   │   ├── partials/
   │   │   ├── header.ejs
   │   │   └── footer.ejs
   │   ├── index.ejs
   │   ├── login.ejs
   │   ├── register.ejs
   │   ├── feature.ejs
   │   ├── deposit.ejs
   │   ├── withdraw.ejs
   │   └── games/
   │       ├── blackjack.ejs
   │       └── ridethebus.ejs
   │
   ├── app.js
   ├── package.json
   ├── .env
   └── README.md
```
used ExpressJSgenerator 

---

## Authors 
- Alexander Wilson - Student
- Ethan Baird - Student
- Mujahid Marwan Abdulkarim - Student




