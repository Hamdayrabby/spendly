# Spendly — Personal Finance Dashboard

A full-stack MERN application for tracking personal finances. Built to go beyond simple transaction logging — Spendly provides behavioral spending analysis, budget management, and savings goal tracking in a clean, responsive dashboard.

---

## Features

- **Transaction Tracking** — Log income and expenses across categorized spending buckets
- **Budget Management** — Set monthly limits per category, with real-time progress tracking and overspend alerts
- **Savings Goals** — Define targets, contribute funds, and track completion with color-coded goal cards
- **Expense Heatmap** — GitHub-style yearly heatmap showing daily spending intensity
- **Daily Spending Chart** — Area chart of day-by-day expenses for the selected month
- **Category Breakdown** — Donut chart of expense distribution with tooltips
- **Smart Insights** — Rule-based spending analysis: weekend patterns, month-over-month spikes, burn-rate budget predictions, and recurring expense detection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| State / Data | Tanstack Query (React Query) |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access token in memory) + HTTP-only refresh token cookie |
| Password | bcrypt |

---

## Project Structure

```
spendly/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── features/        # Page-level components by domain
│       ├── components/      # Shared UI components
│       ├── context/         # Auth context
│       └── lib/             # API client, validators, utils
└── server/                  # Express API
    └── src/
        ├── modules/         # Domain modules (auth, transactions, budgets, goals, analytics)
        ├── middleware/       # Auth guard
        ├── config/          # Env, DB connection
        └── utils/           # Shared utilities (categories)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Hamdayrabby/spendly.git
   cd spendly
   ```

2. **Configure the server**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MONGO_URI and JWT_SECRET
   ```

3. **Install dependencies and seed demo data**

   ```bash
   npm install
   npm run seed    # Creates demo@spendly.com with 3 months of sample data
   ```

4. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

5. **Run the application**

   ```bash
   # Terminal 1 — API server
   cd server && npm run dev

   # Terminal 2 — React dev server
   cd client && npm run dev
   ```

6. **Open** `http://localhost:5173`

### Demo Account

After running `npm run seed`, you can log in with:

```
Email:    demo@spendly.com
Password: password123
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT + sets cookie |
| POST | `/api/auth/refresh` | Refresh access token via cookie |
| POST | `/api/auth/logout` | Clear refresh token cookie |
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/budgets` | Get budgets for a month |
| POST | `/api/budgets` | Upsert a budget |
| GET | `/api/goals` | List savings goals |
| POST | `/api/goals` | Create a goal |
| PATCH | `/api/goals/:id/add-funds` | Contribute to a goal |
| GET | `/api/analytics/dashboard` | Summary, insights, category breakdown |
| GET | `/api/analytics/heatmap` | Yearly daily expense data |
| GET | `/api/analytics/daily-spending` | Monthly daily expense data |

---

## Security

- Passwords hashed with **bcrypt** (salt rounds: 12)
- Access tokens are **short-lived JWTs (15m)** stored in memory only
- Refresh tokens are **7-day JWTs** stored in an **HTTP-only, SameSite=Strict cookie** — inaccessible to JavaScript
- Route-level rate limiting on all auth endpoints (20 req / 15min)
- Global rate limiter (100 req / 15min per IP)
- Helmet.js for HTTP security headers
- CORS restricted to the configured client origin
