const {
  VALID_EXPENSE_KEYS,
  VALID_INCOME_KEYS,
} = require("../../utils/categories");

const validateTransaction = (req, res, next) => {
  const { type, amount, category, description, date } = req.body;
  const errors = [];

  // Type
  if (!type || !["income", "expense"].includes(type)) {
    errors.push("Type must be 'income' or 'expense'");
  }

  // Amount
  const parsedAmount = parseFloat(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be a positive number");
  }

  // Category — validate against known categories OR allow custom
  if (!category || category.trim().length === 0) {
    errors.push("Category is required");
  } else if (type === "expense") {
    // Allow core categories + any custom string (user flexibility)
    // We just check it's not empty — the core list is a suggestion, not a restriction
  } else if (type === "income") {
    // Same approach for income
  }

  // Description
  if (!description || description.trim().length === 0) {
    errors.push("Description is required");
  } else if (description.trim().length > 200) {
    errors.push("Description cannot exceed 200 characters");
  }

  // Date — optional, defaults to now, but validate if provided
  if (date && isNaN(new Date(date).getTime())) {
    errors.push("Invalid date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

module.exports = { validateTransaction };
