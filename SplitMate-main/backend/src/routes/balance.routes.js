const express = require("express");

const authMiddleware = require("../middleware/auth");

const balanceController = require("../controllers/balance.controller");

const router = express.Router();

router.use(authMiddleware);

router.get(
    "/groups/:groupId/balances",
    balanceController.getGroupBalances
);

// router.get(
//     "/groups/:groupId/settlements",
//     balanceController.getSettlements
// );

module.exports = router;