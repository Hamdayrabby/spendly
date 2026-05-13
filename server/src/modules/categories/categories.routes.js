const express = require("express");
const { CORE_CATEGORIES, INCOME_CATEGORIES } = require("../../utils/categories");

const router = express.Router();

// Public route — categories don't require auth
// The frontend needs these before the user even logs in (for display purposes)
router.get("/", (req, res) => {
  res.json({
    expense: CORE_CATEGORIES,
    income: INCOME_CATEGORIES,
  });
});

module.exports = router;
