const express = require("express");
const controller = require("./transaction.controller");
const { validateTransaction } = require("./transaction.validation");
const { protect } = require("../../middleware/auth");

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

// GET /api/transactions/summary?year=2026&month=5
// Put this BEFORE /:id so "summary" doesn't get treated as an ID
router.get("/summary", controller.monthlySummary);

router.post("/", validateTransaction, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", validateTransaction, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
