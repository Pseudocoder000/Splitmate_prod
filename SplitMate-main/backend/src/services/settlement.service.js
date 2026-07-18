const settlementRepository = require("../repositories/settlement.repository");
const activityService = require("./activity.service");
const ACTIVITY = require("../constants/activityType");
const userRepository = require("../repositories/user.repository");
const balanceUpdater = require("../utils/balanceUpdater");
const { emitGroupUpdate } = require("../sockets/socketHandlers");

const createSettlement = async (data) => {
  const settlement = await settlementRepository.create({
    group: data.groupId,
    from: data.from,
    to: data.to,
    amount: data.amount,
    note: data.note,
  });

  await balanceUpdater.settle(settlement);

  const [fromUser, toUser] = await Promise.all([
    userRepository.findById(data.from),
    userRepository.findById(data.to),
  ]);

  await activityService.logActivity({
    group: settlement.group,
    performedBy: settlement.from,
    type: ACTIVITY.SETTLEMENT_CREATED,
    description: `${fromUser?.name || "Someone"} settled ₹${settlement.amount} with ${toUser?.name || "someone"}.`,
    metadata: { settlementId: settlement._id },
  });

  emitGroupUpdate(settlement.group);
  return settlement;
};

const getGroupSettlements = async (groupId) => {
  return settlementRepository.findByGroup(groupId);
};

const getUserSettlements = async (userId) => {
  return settlementRepository.findByUser(userId);
};

const deleteSettlement = async (id) => {
  return settlementRepository.deleteSettlement(id);
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  getUserSettlements,
  deleteSettlement,
};
