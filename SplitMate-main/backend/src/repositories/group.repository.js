const Group = require("../models/Group");

const create = (payload) => Group.create(payload);

const findById = (groupId) =>
  Group.findById(groupId)
    .populate("owner", "-passwordHash")
    .populate("members.user", "-passwordHash");

const findUserGroups = (userId) =>
  Group.find({
    "members.user": userId,
  })
    .populate("owner", "-passwordHash")
    .populate("members.user", "-passwordHash");

const update = (groupId, payload) =>
  Group.findByIdAndUpdate(groupId, payload, {
    new: true,
  })
    .populate("owner", "-passwordHash")
    .populate("members.user", "-passwordHash");

const deleteGroup = (groupId) =>
  Group.findByIdAndDelete(groupId);

module.exports = {
  create,
  findById,
  findUserGroups,
  update,
  deleteGroup,
};