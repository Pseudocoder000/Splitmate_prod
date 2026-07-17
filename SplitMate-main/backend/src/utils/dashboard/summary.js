const balanceService = require("../../services/balance.service");

const getSummary = async ({
    userId,
    groups,
    expenses,
    settlements,
    activities
}) => {

    let totalToReceive = 0;
    let totalToPay = 0;

    for (const group of groups) {

        const balances =
            await balanceService.getGroupBalances(group._id);

        Object.entries(balances).forEach(([id, amount]) => {

            if (id !== userId.toString()) return;

            if (amount > 0)
                totalToReceive += amount;

            else
                totalToPay += Math.abs(amount);

        });

    }

    const totalSpent = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    return {

        totalGroups: groups.length,

        totalExpenses: expenses.length,

        totalSettlements: settlements.length,

        totalActivities: activities,

        totalSpent,

        totalToReceive,

        totalToPay,

        netBalance: totalToReceive - totalToPay

    };

};

module.exports = {
    getSummary
};