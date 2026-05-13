const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Protect routes — verify JWT access token from Authorization header.
 *
 * The client sends: Authorization: Bearer <token>
 * We verify it and attach the userId to req for downstream handlers.
 *
 * WHY not check the database here?
 * - JWTs are self-contained — the signature proves authenticity
 * - Hitting the DB on every request defeats the purpose of stateless tokens
 * - If the user is deleted, the token expires in 15min anyway
 * - The refresh endpoint DOES check the DB (see auth.service.js)
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};

module.exports = { protect };
