const mongoose = require("mongoose");

/**
 * Budget schema — monthly spending limits per category.
 *
 * KEY DESIGN DECISION: We do NOT store "spent" here.
 * Spent amounts are CALCULATED from transactions in real-time.
 * Why?
 * - Transactions are the source of truth
 * - Storing spent here creates a sync problem
 *   (what if a transaction is edited or deleted?)
 * - Calculating on read is fast with our compound indexes
 */
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [1, "Budget must be at least 1"],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per user per category per month
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

budgetSchema.methods.toJSON = function () {
  const budget = this.toObject();
  delete budget.__v;
  return budget;
};

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
