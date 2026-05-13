/**
 * Simple validation middleware factory.
 *
 * WHY not use Joi or express-validator here?
 * - For 3-4 fields, a library adds more complexity than it solves
 * - This is readable, debuggable, and zero-dependency
 * - We'll use Zod on the frontend where it shines with React Hook Form
 * - If validation grows complex, we can always swap in a library later
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Valid email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
