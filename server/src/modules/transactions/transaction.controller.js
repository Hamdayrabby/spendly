const transactionService = require("./transaction.service");
const mongoose = require("mongoose");

const create = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(
      req.userId,
      req.body
    );
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(
      req.userId,
      req.query
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.userId,
      req.params.id
    );
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.userId,
      req.params.id,
      req.body
    );
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.userId, req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    next(error);
  }
};

const monthlySummary = async (req, res, next) => {
  try {
    // Convert userId string to ObjectId for aggregation pipeline
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const summary = await transactionService.getMonthlySummary(
      userObjectId,
      year,
      month
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getOne, update, remove, monthlySummary };
