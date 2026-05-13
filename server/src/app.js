const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./modules/auth/auth.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const budgetRoutes = require("./modules/budgets/budget.routes");
const categoryRoutes = require("./modules/categories/categories.routes");

const app = express();

// ── Security ──────────────────────────────────────────
// Helmet sets various HTTP headers to help protect the app.
// It's one line but does a LOT — Content-Security-Policy,
// X-Content-Type-Options, etc.
app.use(helmet());

// CORS: only allow requests from our frontend
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // needed for HTTP-only cookies
  })
);

// ── Rate Limiting ─────────────────────────────────────
// Global limiter: 100 requests per 15 minutes per IP.
// We'll add stricter limiters on auth routes later.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Body Parsing ──────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // prevent oversized payloads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────
// 'dev' format in development, 'combined' (Apache-style) in production
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health Check ──────────────────────────────────────
// Every production API needs this. Load balancers, uptime monitors,
// and Railway health checks all hit this endpoint.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "spendly-api",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────
// Auth gets a stricter rate limiter — 20 requests per 15 min.
// This prevents brute-force login attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts, please try again later." },
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────
// Express recognizes this as an error handler because it has 4 params.
// This catches any error thrown or passed to next(error).
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message || "Internal server error";

  res.status(statusCode).json({ error: message });
});

module.exports = app;
