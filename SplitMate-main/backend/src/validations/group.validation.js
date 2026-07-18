const { body, validationResult } = require("express-validator");

const { AppError } = require("../utils/errors");

const createGroupValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Group name must be between 2 and 100 characters."),
  body("members")
    .optional()
    .isArray()
    .withMessage("Members must be provided as an array."),
  body("members.*.email")
    .optional()
    .isEmail()
    .withMessage("Each member email must be a valid email address."),
];

const addMemberValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const first = errors.array()[0];

    return next(
      new AppError(first.msg, 400, "VALIDATION_ERROR")
    );
  }

  next();
};

module.exports = {
  createGroupValidation,
  addMemberValidation,
  validate,
};