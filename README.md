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

#### ➡️ See Coinly in action: https://coinly0203.vercel.app/

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure User Registration & Login (JWT & bcrypt)
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
│   ├── app/                 # Next.js App Router (pages, layouts, auth/API logic)
│   ├── actions/             # Next.js Server Actions (ledger calculations, DB queries)
│   ├── components/          # Reusable UI components (IOUContactCard, modals, etc.)
│   ├── models/              # Mongoose database schemas (User, Contact, Entry)
│   └── lib/                 # Utility functions and database connection
├── package.json             # Project dependencies and scripts
└── tailwind.config.ts       # Tailwind CSS configuration
```

---

## 🧩 Models

### 1️⃣ User Model
- Handles secure authentication and user profiles.

### 2️⃣ Contact Model
- Represents individuals with whom the user has financial transactions.
- Tracks contact info and real-time overall balance.

### 3️⃣ Entry/Transaction Model
- Represents individual debt creation or repayment transactions.

#### Relationship:
- **One-to-Many**
  - `1 User` ➝ `Multiple Contacts`
  - `1 Contact` ➝ `Multiple Transactions`

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
Create a `.env.local` file in the root directory and configure your MongoDB URI and JWT Secret:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open browser and visit:**
```bash
http://localhost:3000/
```

---

## 📌 Future Improvements
- Multi-currency support
- Data export functionality (CSV/PDF)
- Dark mode configuration
- Financial charts and analytics

---

## 🤝 Contributing
- Contributions, issues, and feature requests are welcome!
- Feel free to fork this repo and submit pull requests.

--- 

## 📜 License
- This project is open-source and available under the MIT License
