const express = require("express");
const controller = require("./analytics.controller");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/dashboard", controller.getDashboardData);
router.get("/heatmap", controller.getHeatmapData);
router.get("/daily-spending", controller.getDailySpending);

module.exports = router;
