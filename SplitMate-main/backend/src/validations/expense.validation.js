const { body, validationResult } = require("express-validator");

const createExpenseValidation = [

    body("groupId")
        .isMongoId()
        .withMessage("Invalid group id."),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Expense title is required."),

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than zero."),

    body("paidBy")
        .isMongoId()
        .withMessage("Invalid payer id."),

    body("splitType")
        .isIn(["EQUAL", "EXACT", "PERCENTAGE"])
        .withMessage("Invalid split type."),

    body("splits")
        .isArray({ min: 1 })
        .withMessage("Splits are required.")
];

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,

            error: {

                message: errors.array()[0].msg,

                code: "VALIDATION_ERROR"
            }

        });

    }

    next();

};

module.exports = {

    createExpenseValidation,

    validate

};