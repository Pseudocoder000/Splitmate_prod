const jwt = require("jsonwebtoken");

const { jwtAccessSecret } = require("../config/env");

const userRepository = require("../repositories/user.repository");

const { AppError } = require("../utils/errors");

const ERROR_CODES = require("../constants/errorCodes");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    const cookieToken = req.cookies?.accessToken || null;

    const token = bearerToken || cookieToken;

    if (!token) {
      throw new AppError(
        "Authentication required.",
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const payload = jwt.verify(token, jwtAccessSecret);

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new AppError(
        "User no longer exists.",
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Access token expired.",
          401,
          ERROR_CODES.TOKEN_EXPIRED
        )
      );
    }

    next(
      new AppError(
        "Invalid access token.",
        401,
        ERROR_CODES.INVALID_TOKEN
      )
    );
  }
};

module.exports = authMiddleware;