const settlementRepository = require("../repositories/settlement.repository");

const createSettlement = async (data) => {
  await activityService.logActivity({
    group: settlement.group,
    performedBy: settlement.from,
    type: ACTIVITY.SETTLEMENT_CREATED,
    description: `${fromUser.name} settled ₹${settlement.amount} with ${toUser.name}.`,
  });

  return settlementRepository.create({
    group: data.groupId,
    from: data.from,
    to: data.to,
    amount: data.amount,
    note: data.note,
  });
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
