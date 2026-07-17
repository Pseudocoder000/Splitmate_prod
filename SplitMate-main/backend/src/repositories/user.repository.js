const User = require('../models/User');

const create = (payload) => User.create(payload);

const findByEmail = (email) =>
  User.findOne({
    email: email.toLowerCase()
  });

const findById = (id) =>
  User.findById(id);

module.exports = {
  create,
  findByEmail,
  findById
};