/**
 * Core spending categories.
 *
 * WHY define these centrally?
 * - Transactions, budgets, and analytics all reference the same list
 * - Consistent icons and colors across the frontend
 * - Analytics can reliably aggregate by these categories
 * - Users can add custom ones, but these are always available
 *
 * Each category has a key (used in DB), label (displayed to user),
 * icon (emoji for quick prototyping — we'll swap to proper icons in the frontend),
 * and color (for charts).
 */
const CORE_CATEGORIES = [
  { key: "food", label: "Food & Dining", icon: "🍕", color: "#FF6B6B" },
  { key: "transport", label: "Transport", icon: "🚗", color: "#4ECDC4" },
  { key: "housing", label: "Housing & Rent", icon: "🏠", color: "#45B7D1" },
  { key: "utilities", label: "Utilities", icon: "💡", color: "#96CEB4" },
  { key: "entertainment", label: "Entertainment", icon: "🎬", color: "#FFEAA7" },
  { key: "shopping", label: "Shopping", icon: "🛍️", color: "#DDA0DD" },
  { key: "health", label: "Health & Medical", icon: "🏥", color: "#98D8C8" },
  { key: "education", label: "Education", icon: "📚", color: "#F7DC6F" },
  { key: "personal", label: "Personal Care", icon: "💇", color: "#BB8FCE" },
  { key: "savings", label: "Savings & Investment", icon: "💰", color: "#82E0AA" },
  { key: "gifts", label: "Gifts & Donations", icon: "🎁", color: "#F0B27A" },
  { key: "other", label: "Other", icon: "📦", color: "#AEB6BF" },
];

// Income categories — separate because income and expense categories
// serve different analytical purposes
const INCOME_CATEGORIES = [
  { key: "salary", label: "Salary", icon: "💼", color: "#27AE60" },
  { key: "freelance", label: "Freelance", icon: "💻", color: "#2ECC71" },
  { key: "business", label: "Business", icon: "📈", color: "#1ABC9C" },
  { key: "investments", label: "Investment Returns", icon: "📊", color: "#16A085" },
  { key: "other_income", label: "Other Income", icon: "💵", color: "#45B39D" },
];

// Quick lookup set for validation
const VALID_EXPENSE_KEYS = CORE_CATEGORIES.map((c) => c.key);
const VALID_INCOME_KEYS = INCOME_CATEGORIES.map((c) => c.key);

module.exports = {
  CORE_CATEGORIES,
  INCOME_CATEGORIES,
  VALID_EXPENSE_KEYS,
  VALID_INCOME_KEYS,
};
