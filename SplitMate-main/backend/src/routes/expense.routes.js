const express = require("express");

const auth = require("../middleware/auth");

const controller = require("../controllers/expense.controller");

const {
    createExpenseValidation,
    validate
} = require("../validations/expense.validation");

const router = express.Router();

router.use(auth);

router.post(
    "/",
    createExpenseValidation,
    validate,
    controller.create
);

router.get(
    "/:id",
    controller.getById
);

router.put(
    "/:id",
    controller.update
);

router.delete(
    "/:id",
    controller.delete
);

router.get(
    "/group/:groupId",
    controller.getGroupExpenses
);

module.exports = router;