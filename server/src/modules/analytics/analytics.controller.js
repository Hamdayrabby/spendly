const analyticsService = require("./analytics.service");

const getDashboardData = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    // Run calculations in parallel
    const [healthScore, insights] = await Promise.all([
      analyticsService.calculateHealthScore(req.userId, year, month),
      analyticsService.generateInsights(req.userId, year, month),
    ]);

    res.json({
      year,
      month,
      healthScore,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };
