const jwt = require("jsonwebtoken");
const User = require("./user.model");
const env = require("../../config/env");

/**
 * Generate a JWT access token.
 * Short-lived (15min) — stored in memory on the client, never in localStorage.
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Generate a refresh token.
 * Longer-lived (7 days) — sent as HTTP-only cookie, not accessible to JS.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Register a new user.
 * Returns the user object and tokens.
 *
 * Note: password hashing happens automatically in the User model's
 * pre-save hook — we don't do it here. The service doesn't need to
 * know HOW passwords are secured, just that they are.
 */
const register = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

/**
 * Log in an existing user.
 * We explicitly select +password because the model excludes it by default.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

/**
 * Refresh the access token using a valid refresh token.
 * The refresh token comes from an HTTP-only cookie.
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("No refresh token provided");
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);

    // Verify the user still exists (they might have been deleted)
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error("User no longer exists");
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = generateAccessToken(user._id);
    return { accessToken: newAccessToken, user };
  } catch (err) {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Get user profile by ID.
 * Used by the /me endpoint and auth middleware.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { register, login, refreshAccessToken, getUserById };
