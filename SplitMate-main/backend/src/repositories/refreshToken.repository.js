const RefreshToken = require('../models/RefreshToken');

const create = (payload) =>
  RefreshToken.create(payload);

const findValidToken = (query) =>
  RefreshToken.findOne(query);

const revokeAllUserTokens = (userId) =>
  RefreshToken.updateMany(
    {
      userId,
      revokedAt: null
    },
    {
      revokedAt: new Date()
    }
  );

module.exports = {
  create,
  findValidToken,
  revokeAllUserTokens
};