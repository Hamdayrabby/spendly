const authService = require("./auth.service");
const env = require("../../config/env");

// Cookie options for the refresh token.
// httpOnly: JS can't read it (XSS protection)
// secure: only sent over HTTPS (in production)
// sameSite: strict prevents CSRF
// maxAge: matches the refresh token expiration
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
    });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      message: "Account created successfully",
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { accessToken, user } = await authService.refreshAccessToken(
      refreshToken
    );

    res.json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  // Clear the refresh token cookie.
  // The access token (in client memory) expires on its own.
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe };
