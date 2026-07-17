const getCharts = (expenses) => {

    const monthlyExpenseChart = {};

    const categoryChart = {};

    const groupSpendingChart = {};

    expenses.forEach(expense => {

        const month =
            new Date(expense.createdAt)
                .toLocaleString(
                    "default",
                    {
                        month: "short"
                    }
                );

        monthlyExpenseChart[month] =
            (monthlyExpenseChart[month] || 0) +
            expense.amount;

        categoryChart[expense.expenseType] =
            (categoryChart[expense.expenseType] || 0) +
            expense.amount;

        const group =
            expense.group.name;

        groupSpendingChart[group] =
            (groupSpendingChart[group] || 0) +
            expense.amount;

    });

    return {

        monthlyExpenseChart,

        categoryChart,

        groupSpendingChart

    };

};

module.exports = {
    getCharts
};