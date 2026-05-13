const express = require("express");
const controller = require("./analytics.controller");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/dashboard", controller.getDashboardData);

module.exports = router;
