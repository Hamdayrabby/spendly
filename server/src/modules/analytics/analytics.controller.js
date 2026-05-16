const analyticsService = require("./analytics.service");
const Transaction = require("../transactions/transaction.model");
const mongoose = require("mongoose");

const getDashboardData = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    // Run calculations in parallel
    const [healthScore, insights, categories] = await Promise.all([
      analyticsService.calculateHealthScore(req.userId, year, month),
      analyticsService.generateInsights(req.userId, year, month),
      analyticsService.getCategoryBreakdown(req.userId, year, month),
    ]);

    res.json({
      year,
      month,
      healthScore,
      insights,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/heatmap?year=2026
 * Returns daily expense totals for the entire year
 * Format: [{ date: "2026-01-15", total: 450 }, ...]
 */
const getHeatmapData = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const dailyTotals = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
        },
      },
    ]);

    res.json({ year, data: dailyTotals });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/daily-spending?month=5&year=2026
 * Returns daily expense totals for a specific month
 */
const getDailySpending = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const dailyTotals = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          day: "$_id",
          total: 1,
        },
      },
    ]);

    // Fill in missing days with 0
    const daysInMonth = new Date(year, month, 0).getDate();
    const filled = [];
    const dataMap = Object.fromEntries(dailyTotals.map((d) => [d.day, d.total]));
    for (let d = 1; d <= daysInMonth; d++) {
      filled.push({ day: d, total: dataMap[d] || 0 });
    }

    res.json({ year, month, data: filled });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData, getHeatmapData, getDailySpending };

