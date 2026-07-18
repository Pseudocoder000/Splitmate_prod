const Settlement = require("../models/Settlement");

const create = async (payload, session = null) => {
  const settlement = new Settlement(payload);

  if (session) {
    await settlement.save({ session });
    return settlement;
  }

  await settlement.save();
  return settlement;
};

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