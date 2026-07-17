const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");

const { AppError } = require("../utils/errors");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { hashToken } = require("../utils/crypto");
const {
  setAuthCookies,
  clearAuthCookies,
} = require("../utils/cookies");

const {
  jwtRefreshSecret,
  jwtRefreshExpiresIn,
} = require("../config/env");

const ERROR_CODES = require("../constants/errorCodes");

class AuthService {
  async signup({ name, email, password }, res) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "An account with this email already exists.",
        409,
        ERROR_CODES.EMAIL_EXISTS
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await refreshTokenRepository.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, refreshToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async login({ email, password }, res) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(
        "Invalid email or password.",
        401,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new AppError(
        "Invalid email or password.",
        401,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await refreshTokenRepository.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, refreshToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async logout(userId, res) {
    await refreshTokenRepository.revokeAllUserTokens(userId);

    clearAuthCookies(res);

    return null;
  }

  async refresh(incomingRefreshToken, res) {
    if (!incomingRefreshToken) {
      throw new AppError(
        "Refresh token is required.",
        401,
        ERROR_CODES.REFRESH_REQUIRED
      );
    }

    let payload;

    try {
      payload = jwt.verify(
        incomingRefreshToken,
        jwtRefreshSecret
      );
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError(
          "Refresh token expired.",
          401,
          ERROR_CODES.REFRESH_EXPIRED
        );
      }

      throw new AppError(
        "Invalid refresh token.",
        401,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      );
    }

    const storedToken =
      await refreshTokenRepository.findValidToken({
        userId: payload.userId,
        tokenHash: hashToken(incomingRefreshToken),
        revokedAt: null,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!storedToken) {
      throw new AppError(
        "Refresh token is invalid or revoked.",
        401,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      );
    }

    const newAccessToken = signAccessToken(payload.userId);
    const newRefreshToken = signRefreshToken(payload.userId);

    storedToken.revokedAt = new Date();
    storedToken.replacedByTokenHash =
      hashToken(newRefreshToken);

    await storedToken.save();

    await refreshTokenRepository.create({
      userId: payload.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    setAuthCookies(
      res,
      newAccessToken,
      newRefreshToken
    );

    return {
      accessToken: newAccessToken,
    };
  }

  async me(user) {
    return {
      user,
    };
  }
}

module.exports = new AuthService();