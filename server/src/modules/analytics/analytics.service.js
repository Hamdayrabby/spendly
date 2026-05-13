const Transaction = require("../transactions/transaction.model");
const Budget = require("../budgets/budget.model");
const mongoose = require("mongoose");

/**
 * Calculate the Financial Health Score (0-100)
 * Based on:
 * 1. Savings Rate (40 points)
 * 2. Budget Adherence (30 points)
 * 3. Spend to Income Ratio (30 points)
 */
const calculateHealthScore = async (userId, year, month) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 1. Get totals
  const totals = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let income = 0;
  let expenses = 0;

  totals.forEach((t) => {
    if (t._id === "income") income = t.total;
    if (t._id === "expense") expenses = t.total;
  });

  // Base score
  let score = 0;
  let details = [];

  // Metric 1: Savings Rate (40 points)
  let savingsRate = 0;
  if (income > 0) {
    savingsRate = ((income - expenses) / income) * 100;
    if (savingsRate >= 20) {
      score += 40;
      details.push({ metric: "Savings Rate", score: 40, max: 40, status: "excellent", text: "Saving >20% of income" });
    } else if (savingsRate >= 10) {
      score += 25;
      details.push({ metric: "Savings Rate", score: 25, max: 40, status: "good", text: "Saving 10-20% of income" });
    } else if (savingsRate > 0) {
      score += 10;
      details.push({ metric: "Savings Rate", score: 10, max: 40, status: "fair", text: "Saving <10% of income" });
    } else {
      details.push({ metric: "Savings Rate", score: 0, max: 40, status: "poor", text: "Spending more than earning" });
    }
  } else {
    details.push({ metric: "Savings Rate", score: 0, max: 40, status: "neutral", text: "No income recorded this month" });
  }

  // Metric 2: Budget Adherence (30 points)
  const budgets = await Budget.find({ user: userId, month, year });
  if (budgets.length > 0) {
    // Get spending for budget categories
    const budgetCategories = budgets.map((b) => b.category);
    const spending = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: "expense",
          category: { $in: budgetCategories },
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

    const spendingMap = {};
    spending.forEach((s) => (spendingMap[s._id] = s.spent));

    let overBudgetCount = 0;
    budgets.forEach((b) => {
      const spent = spendingMap[b.category] || 0;
      if (spent > b.amount) overBudgetCount++;
    });

    if (overBudgetCount === 0) {
      score += 30;
      details.push({ metric: "Budgeting", score: 30, max: 30, status: "excellent", text: "All budgets maintained" });
    } else if (overBudgetCount === 1) {
      score += 15;
      details.push({ metric: "Budgeting", score: 15, max: 30, status: "good", text: "1 budget exceeded" });
    } else {
      details.push({ metric: "Budgeting", score: 0, max: 30, status: "poor", text: `${overBudgetCount} budgets exceeded` });
    }
  } else {
    // No budgets set - missed opportunity for points
    details.push({ metric: "Budgeting", score: 0, max: 30, status: "neutral", text: "No budgets set this month" });
  }

  // Metric 3: Spend-to-Income Ratio (30 points)
  if (income > 0) {
    const ratio = (expenses / income) * 100;
    if (ratio <= 50) {
      score += 30;
      details.push({ metric: "Spend Ratio", score: 30, max: 30, status: "excellent", text: "Spending ≤50% of income" });
    } else if (ratio <= 75) {
      score += 20;
      details.push({ metric: "Spend Ratio", score: 20, max: 30, status: "good", text: "Spending 51-75% of income" });
    } else if (ratio <= 95) {
      score += 10;
      details.push({ metric: "Spend Ratio", score: 10, max: 30, status: "fair", text: "Spending 76-95% of income" });
    } else {
      details.push({ metric: "Spend Ratio", score: 0, max: 30, status: "poor", text: "Spending >95% of income" });
    }
  } else {
    details.push({ metric: "Spend Ratio", score: 0, max: 30, status: "neutral", text: "No income to compare" });
  }

  return {
    score,
    grade: score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D",
    details,
    summary: { income, expenses, savingsRate },
  };
};

/**
 * Generate Smart Insights (Rule-based)
 */
const generateInsights = async (userId, year, month) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const insights = [];

  const currentStartDate = new Date(year, month - 1, 1);
  const currentEndDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  // Previous month dates
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear--;
  }
  const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
  const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

  // 1. Weekend vs Weekday Spending (Current Month)
  const txs = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: currentStartDate, $lte: currentEndDate }
  });

  if (txs.length > 0) {
    let weekendSpend = 0;
    let weekdaySpend = 0;

    txs.forEach((tx) => {
      const day = new Date(tx.date).getDay();
      if (day === 0 || day === 6) { // 0 = Sunday, 6 = Saturday
        weekendSpend += tx.amount;
      } else {
        weekdaySpend += tx.amount;
      }
    });

    const weekendAvg = weekendSpend / 2; // Roughly 2 weekend days per week * 4
    const weekdayAvg = weekdaySpend / 5; // Roughly 5 weekdays per week * 4
    
    // Very simplified logic, but good enough for a conceptual insight
    if (weekendAvg > weekdayAvg * 1.5) {
      insights.push({
        type: "warning",
        title: "Weekend Spender",
        message: "You tend to spend significantly more on weekends. Consider planning weekend activities in advance to control costs."
      });
    }
  }

  // 2. Month over Month Category Comparison
  const currentCatSpend = await Transaction.aggregate([
    { $match: { user: userObjectId, type: "expense", date: { $gte: currentStartDate, $lte: currentEndDate } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  const prevCatSpend = await Transaction.aggregate([
    { $match: { user: userObjectId, type: "expense", date: { $gte: prevStartDate, $lte: prevEndDate } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  const prevMap = {};
  prevCatSpend.forEach(c => (prevMap[c._id] = c.total));

  currentCatSpend.forEach(c => {
    const prev = prevMap[c._id];
    if (prev && prev > 0) {
      const increase = ((c.total - prev) / prev) * 100;
      if (increase > 25 && c.total > 500) { // Significant increase on meaningful amount
        insights.push({
          type: "alert",
          title: "Spending Spike",
          message: `Your ${c._id} expenses have increased by ${Math.round(increase)}% compared to last month.`
        });
      }
    }
  });

  // 3. Burn Rate / Budget Prediction (if in current month)
  const today = new Date();
  if (today.getMonth() + 1 === month && today.getFullYear() === year) {
    const daysInMonth = currentEndDate.getDate();
    const currentDay = today.getDate();
    
    // Only predict if we are between day 5 and day 25
    if (currentDay >= 5 && currentDay <= 25) {
      const budgets = await Budget.find({ user: userId, month, year });
      
      for (const budget of budgets) {
        const spentObj = currentCatSpend.find(c => c._id === budget.category);
        const spent = spentObj ? spentObj.total : 0;
        
        // Linear projection
        const projectedSpend = (spent / currentDay) * daysInMonth;
        
        if (projectedSpend > budget.amount && spent < budget.amount) {
          insights.push({
            type: "prediction",
            title: "Budget Risk",
            message: `At your current rate, you will exceed your ${budget.category} budget by ৳${Math.round(projectedSpend - budget.amount)}.`
          });
        }
      }
    }
  }

  // 4. Positive reinforcement
  if (insights.length === 0 && txs.length > 5) {
     insights.push({
        type: "success",
        title: "On Track",
        message: "Your spending patterns look stable and predictable this month. Keep it up!"
      });
  }

  return insights;
};

module.exports = {
  calculateHealthScore,
  generateInsights
};
