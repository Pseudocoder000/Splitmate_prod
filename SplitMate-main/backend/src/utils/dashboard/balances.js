const balanceService =
    require("../../services/balance.service");

const getBalances = async (groups) => {

    const balances = [];

    const settlements = [];

    for (const group of groups) {

        balances.push({

            group: group.name,

            balances:
                await balanceService.getGroupBalances(group._id)

        });

        settlements.push({

            group: group.name,

            settlements:
                await balanceService.getSettlements(group._id)

        });

    }

    return {

        balances,

        pendingSettlements: settlements

    };

};

module.exports = {
    getBalances
};