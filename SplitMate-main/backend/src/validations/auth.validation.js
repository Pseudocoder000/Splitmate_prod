const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const first = errors.array()[0];

    return next(
      new AppError(
        first.msg,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  validate
};