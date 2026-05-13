const Transaction = require("./transaction.model");

/**
 * Create a new transaction.
 */
const createTransaction = async (userId, data) => {
  const transaction = await Transaction.create({
    ...data,
    user: userId,
  });
  return transaction;
};

/**
 * Get transactions with filtering, sorting, and pagination.
 *
 * WHY build the filter object dynamically?
 * - Each query param is optional
 * - We only add filters that are actually present
 * - This avoids empty string matches or undefined comparisons
 *
 * Pagination uses skip/limit — fine for our scale.
 * For millions of records you'd use cursor-based pagination,
 * but that's premature optimization here.
 */
const getTransactions = async (userId, query = {}) => {
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    tags,
    page = 1,
    limit = 20,
    sortBy = "date",
    sortOrder = "desc",
  } = query;

  // Build filter — always scoped to the current user
  const filter = { user: userId };

  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();

  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Text search on description
  if (search) {
    filter.description = { $regex: search, $options: "i" };
  }

  // Tags filter — find transactions that have ANY of the specified tags
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    filter.tags = { $in: tagList };
  }

  // Build sort
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Execute with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get a single transaction (with ownership check).
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Update a transaction (with ownership check).
 *
 * We use findOneAndUpdate with { new: true } to get the updated doc.
 * runValidators ensures schema validations still apply on update.
 */
const updateTransaction = async (userId, transactionId, data) => {
  // Don't allow changing the owner
  delete data.user;

  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, user: userId },
    data,
    { returnDocument: "after", runValidators: true }
  );

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Delete a transaction (with ownership check).
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Get spending summary for a given month.
 * Used by the dashboard and budget tracking.
 *
 * MongoDB aggregation pipeline — this is where Mongo really shines.
 * We group by category and sum amounts, all in a single DB query.
 */
const getMonthlySummary = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const summary = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { type: "$type", category: "$category" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  // Reshape into a more usable format
  const income = { total: 0, categories: [] };
  const expenses = { total: 0, categories: [] };

  for (const item of summary) {
    const entry = {
      category: item._id.category,
      total: item.total,
      count: item.count,
    };

    if (item._id.type === "income") {
      income.total += item.total;
      income.categories.push(entry);
    } else {
      expenses.total += item.total;
      expenses.categories.push(entry);
    }
  }

  return {
    year,
    month,
    income,
    expenses,
    netSavings: income.total - expenses.total,
  };
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
};
