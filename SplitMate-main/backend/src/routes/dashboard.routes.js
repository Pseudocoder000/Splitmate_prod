const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const dashboardController =
    require("../controllers/dashboard.controller");

router.use(authMiddleware);

router.get(
    "/",
    dashboardController.getDashboard
);

module.exports = router;