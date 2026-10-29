# 💰 Coinly – Expense Tracker

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

### Coinly is a full-stack **Next.js-based Financial Web Application** built using **React** and **Tailwind CSS**.  
### It allows users to track their personal debts, manage IOUs, and maintain a clear ledger of financial transactions with secure authentication and a modern UI.
### The project demonstrates strong fundamentals in **Full-Stack Development, NoSQL database design, secure server actions, and responsive layout**.

---

### 🔗 Live Demo (Deployed)

#### ➡️ See Coinly in action: https://mycoinly.vercel.app/

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure login (JWT in an httpOnly cookie & bcrypt); public registration is switched off
- Login rate limiting (Upstash Redis)
- Robust Input Validation using Zod
- Protection against NoSQL Injection vulnerabilities

### ✅ Debt & Ledger Management (CRUD)
- Create new IOU transactions (Borrow/Lend)
- Repay debts and track partial settlements
- View detailed ledger balances opening and closing across transactions
- Manage contacts and their associated debts

### 📂 Transaction Viewing & Filtering
- View all active debts and IOUs
- Filter and review settled vs pending balances
- Detailed transaction history per contact

---

## 🧠 System Design Overview

- **Architecture:** Next.js App Router (React Server Components & Server Actions)
- **Authentication:** Custom JWT Authorization
- **Database Design:** MongoDB (NoSQL) with Strict Mongoose Schemas
- **UI:** Responsive, mobile-first design using Tailwind CSS

---

## 🛠️ Tech Stack
- **Programming Language:** TypeScript
- **Framework:** Next.js
- **Frontend:** React, Tailwind CSS
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Version Control:** Git & GitHub

---

## 🏗️ Project Structure

```
coinly/
├── src/
│   ├── app/                 # Next.js App Router (pages, layouts)
│   │   └── actions/         # Server Actions (ledger, IOU, payment methods, auth, profile)
│   ├── components/          # UI components (ledger, entry form, debt cards, profile, ...)
│   ├── models/              # Mongoose schemas (User, Entry, IOUContact, PaymentMethod, MandatoryExpense)
│   ├── lib/                 # DB connection, JWT/session helpers, Zod validations, rate limiting
│   ├── types/               # Shared TypeScript types
│   ├── __tests__/           # Vitest tests (in-memory MongoDB replica set)
│   └── proxy.ts             # Route protection (Next.js proxy, formerly middleware)
├── scripts/                 # One-off maintenance scripts
└── package.json             # Dependencies and scripts
```

---

## 🧩 Models

- **User** – the account owner (single-user app).
- **PaymentMethod** – named balances (Cash, Bank, ...) that entries move money in and out of.
- **Entry** – a ledger line (expense or cash-in); may embed IOU data (contact, debt/receivable, create/repay).
- **IOUContact** – a person you lend to / borrow from, with running `total_receivable` / `total_debt`.
- **MandatoryExpense** – recurring monthly bills (feature currently hidden in the UI).

Entries, payment-method balances and contact totals are updated together inside a MongoDB transaction.

---

## ⚙️ Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/coinly.git
cd coinly
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Copy `.env.example` to `.env.local` and fill it in (MongoDB URI, JWT secret, Upstash Redis credentials for rate limiting).
Transactions require a replica set (Atlas works out of the box).

4. **Run the development server**
```bash
npm run dev
```

5. **Open browser and visit:**
```bash
http://localhost:3000/
```

6. **Run the tests** (downloads an in-memory MongoDB the first time)
```bash
npm test
```

---

## 📌 Future Improvements
- Multi-currency support
- Data export functionality (CSV/PDF)
- Dark mode configuration
- Financial charts and analytics

---

## 🏗️ Infrastructure & Upgrade Path

Current stack runs on free tiers. Recommended upgrade path for stable lifetime use:

| Service | Current | Recommended | Cost |
|---------|---------|-------------|------|
| MongoDB Atlas | M0 (Free, 512MB, shared) | M2 (Shared, dedicated RAM) | ~$9/mo |
| Vercel | Hobby (10s timeout, cold starts) | Pro (warmed functions, 60s timeout) | ~$20/mo |
| Upstash Redis | Free tier | Free tier (sufficient for personal use) | Free |

**Why Atlas M2?** The M0 free cluster uses a shared connection pool and has no dedicated RAM. As your data grows, query performance degrades. M2 gives a dedicated RAM allocation and a much better connection pool — for ~$9/mo it's the single most impactful infrastructure upgrade.

**Cold start note:** Vercel serverless functions spin down after inactivity. Your first load of the day is slow because of this + a new MongoDB connection being established. Vercel Pro's "always-warm" feature eliminates this.


## 🤝 Contributing
- Contributions, issues, and feature requests are welcome!
- Feel free to fork this repo and submit pull requests.

--- 

## 📜 License
- This project is open-source and available under the MIT License
