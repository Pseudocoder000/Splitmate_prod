const balanceRepository = require("../repositories/balance.repository");

const getGroupBalances = async (groupId) => {

    return balanceRepository.getGroupBalances(groupId);

};

const getSettlements = async (groupId) => {

    return balanceRepository.getGroupBalances(groupId);

};

module.exports = {
    getGroupBalances,
    getSettlements,
};