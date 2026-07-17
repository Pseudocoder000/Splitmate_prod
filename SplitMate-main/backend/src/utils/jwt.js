const jwt = require('jsonwebtoken');

const {
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn,
  jwtRefreshExpiresIn
} = require('../config/env');

const signAccessToken = (userId) =>
  jwt.sign(
    {
      userId
    },
    jwtAccessSecret,
    {
      expiresIn: jwtAccessExpiresIn
    }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    {
      userId
    },
    jwtRefreshSecret,
    {
      expiresIn: jwtRefreshExpiresIn
    }
  );

module.exports = {
  signAccessToken,
  signRefreshToken
};