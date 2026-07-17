const Settlement = require("../models/Settlement");

const create = (payload) =>
  Settlement.create(payload);

const findByGroup = (groupId) =>
  Settlement.find({ group: groupId })
    .populate("from", "name email")
    .populate("to", "name email")
    .sort({ settledAt: -1 });

const findByUser = (userId) =>
  Settlement.find({
    $or: [
      { from: userId },
      { to: userId },
    ],
  })
    .populate("group", "name")
    .populate("from", "name email")
    .populate("to", "name email")
    .sort({ settledAt: -1 });

const deleteSettlement = (id) =>
  Settlement.findByIdAndDelete(id);

module.exports = {
  create,
  findByGroup,
  findByUser,
  deleteSettlement,
};