const validateBudget = (req, res, next) => {
  const { category, amount, month, year } = req.body;
  const errors = [];

  if (!category || category.trim().length === 0) {
    errors.push("Category is required");
  }

  const parsedAmount = parseFloat(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount < 1) {
    errors.push("Budget amount must be at least 1");
  }

  const parsedMonth = parseInt(month);
  if (!month || parsedMonth < 1 || parsedMonth > 12) {
    errors.push("Month must be between 1 and 12");
  }

  const parsedYear = parseInt(year);
  if (!year || parsedYear < 2020 || parsedYear > 2030) {
    errors.push("Year must be between 2020 and 2030");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

module.exports = { validateBudget };
