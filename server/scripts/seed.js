require("dotenv").config();
const mongoose = require("mongoose");
const env = require("../src/config/env");
const User = require("../src/modules/auth/user.model");
const Transaction = require("../src/modules/transactions/transaction.model");
const Budget = require("../src/modules/budgets/budget.model");
const { CORE_CATEGORIES } = require("../src/utils/categories");

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB Connected for Seeding");
  } catch (error) {
    console.error("DB Connection Failed", error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await User.deleteMany({ email: "demo@spendly.com" });
  // We'll only delete transactions and budgets for the demo user later

  console.log("Creating Demo User...");
  const user = await User.create({
    name: "Demo User",
    email: "demo@spendly.com",
    password: "password123", // Will be hashed by pre-save hook
    currency: "BDT"
  });

  console.log(`Demo User Created: ${user._id}`);

  // Clear demo user's old data just in case
  await Transaction.deleteMany({ user: user._id });
  await Budget.deleteMany({ user: user._id });

  // Generate 3 months of data
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  console.log("Creating Budgets...");
  const budgetCategories = ["food", "transport", "entertainment", "shopping", "utilities"];
  const budgetAmounts = [15000, 5000, 4000, 8000, 6000];

  for (let i = 0; i < 3; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    for (let j = 0; j < budgetCategories.length; j++) {
      await Budget.create({
        user: user._id,
        category: budgetCategories[j],
        amount: budgetAmounts[j],
        month: m,
        year: y
      });
    }
  }

  console.log("Creating Transactions...");
  const transactions = [];

  for (let i = 0; i < 3; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    // Fixed Income
    transactions.push({
      user: user._id,
      type: "income",
      amount: 80000,
      category: "salary",
      description: "Monthly Salary",
      date: new Date(y, m - 1, 1)
    });

    // Generate random expenses
    const daysInMonth = new Date(y, m, 0).getDate();
    // 30-40 transactions per month
    const numTxs = Math.floor(Math.random() * 10) + 30;

    for (let j = 0; j < numTxs; j++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const date = new Date(y, m - 1, day);
      
      // Pick a random category
      const categoryObj = CORE_CATEGORIES[Math.floor(Math.random() * CORE_CATEGORIES.length)];
      
      // Weekends tend to be more expensive for entertainment/food in our logic
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let amount = Math.floor(Math.random() * 1000) + 200;
      
      if (isWeekend && (categoryObj.key === "food" || categoryObj.key === "entertainment")) {
        amount *= 2.5; // Simulate weekend spender insight
      }

      transactions.push({
        user: user._id,
        type: "expense",
        amount,
        category: categoryObj.key,
        description: `Dummy ${categoryObj.label} Expense`,
        date
      });
    }
  }

  await Transaction.insertMany(transactions);
  console.log(`Inserted ${transactions.length} transactions.`);

  console.log("Seeding Complete!");
  console.log("-----------------------------------------");
  console.log("Demo Login:");
  console.log("Email: demo@spendly.com");
  console.log("Password: password123");
  console.log("-----------------------------------------");

  process.exit(0);
};

seedData();
