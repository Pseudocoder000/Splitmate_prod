const { body } = require("express-validator");

const validateSettlement = [
  body("groupId")
    .notEmpty()
    .withMessage("Group is required"),

  body("from")
    .notEmpty()
    .withMessage("From user is required"),

  body("to")
    .notEmpty()
    .withMessage("To user is required"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero"),
];

module.exports = {
  validateSettlement,
};