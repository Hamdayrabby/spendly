const express = require("express");
const controller = require("./budget.controller");
const { validateBudget } = require("./budget.validation");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", validateBudget, controller.upsert);
router.get("/", controller.getMonthly);
router.delete("/:id", controller.remove);

module.exports = router;
