const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // we ALWAYS query by user, so index it
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Compound index for the most common query pattern:
 * "Get all transactions for user X in date range Y"
 *
 * WHY compound and not separate indexes?
 * - MongoDB can only use ONE index per query
 * - A compound index on {user, date} handles both
 *   "all user's transactions" AND "user's transactions in date range"
 * - Sorting by date descending (-1) matches our default sort order
 */
transactionSchema.index({ user: 1, date: -1 });

// For category-based analytics queries
transactionSchema.index({ user: 1, category: 1, date: -1 });

// Clean up __v in JSON responses
transactionSchema.methods.toJSON = function () {
  const tx = this.toObject();
  delete tx.__v;
  return tx;
};

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
