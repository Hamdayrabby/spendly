const Budget = require("./budget.model");
const Transaction = require("../transactions/transaction.model");
const mongoose = require("mongoose");

/**
 * Create or update a budget for a category/month.
 * Uses upsert — if a budget exists for this category+month, update it.
 * This is more user-friendly than throwing a "duplicate" error.
 */
const upsertBudget = async (userId, data) => {
  const { category, amount, month, year } = data;

  const budget = await Budget.findOneAndUpdate(
    { user: userId, category, month, year },
    { amount },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  return budget;
};

/**
 * Get all budgets for a given month, with actual spending calculated
 * from transactions.
 *
 * This is the key query — it combines budget limits with real spending
 * to show how much of each budget is used.
 */
const getBudgetsWithSpending = async (userId, year, month) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get all budgets for this month
  const budgets = await Budget.find({ user: userId, month, year });

  if (budgets.length === 0) return [];

  // Get actual spending grouped by category for this month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const spending = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: "expense",
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$category",
        spent: { $sum: "$amount" },
      },
    },
  ]);

  // Create a lookup map: category -> spent amount
  const spendingMap = {};
  for (const item of spending) {
    spendingMap[item._id] = item.spent;
  }

  // Combine budgets with spending data
  return budgets.map((budget) => {
    const spent = spendingMap[budget.category] || 0;
    const remaining = budget.amount - spent;
    const percentage = Math.round((spent / budget.amount) * 100);

    return {
      ...budget.toJSON(),
      spent,
      remaining,
      percentage: Math.min(percentage, 100), // cap at 100 for display
      isOverBudget: spent > budget.amount,
    };
  });
};

/**
 * Delete a specific budget.
 */
const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  return budget;
};

module.exports = { upsertBudget, getBudgetsWithSpending, deleteBudget };
