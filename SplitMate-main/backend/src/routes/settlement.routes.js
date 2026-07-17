const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const settlementController = require("../controllers/settlement.controller");

const {
    validateSettlement
} = require("../validations/settlement.validation");

router.use(authMiddleware);

router.post(
    "/",
    validateSettlement,
    settlementController.createSettlement
);

router.get(
    "/groups/:groupId/history",
    settlementController.getGroupSettlements
);

router.get(
    "/me",
    settlementController.getUserSettlements
);

router.delete(
    "/:id",
    settlementController.deleteSettlement
);

module.exports = router;