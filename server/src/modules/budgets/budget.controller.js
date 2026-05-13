const budgetService = require("./budget.service");

const upsert = async (req, res, next) => {
  try {
    const budget = await budgetService.upsertBudget(req.userId, req.body);
    res.status(200).json({ budget });
  } catch (error) {
    next(error);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const budgets = await budgetService.getBudgetsWithSpending(
      req.userId,
      year,
      month
    );
    res.json({ budgets });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.userId, req.params.id);
    res.json({ message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { upsert, getMonthly, remove };
