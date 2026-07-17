const getExpenseStatistics = (expenses) => {

    if (!expenses.length) {

        return {

            largestExpense: null,

            averageExpense: 0,

            todayExpense: 0,

            weeklyExpense: 0,

            monthlyExpense: 0

        };

    }

    const now = new Date();

    const today = now.toDateString();

    const weekAgo = new Date(now);

    weekAgo.setDate(now.getDate() - 7);

    const month = now.getMonth();

    const year = now.getFullYear();

    const largestExpense = expenses.reduce(
        (a, b) => a.amount > b.amount ? a : b
    );

    const averageExpense =
        expenses.reduce((sum, e) => sum + e.amount, 0) /
        expenses.length;

    const todayExpense =
        expenses
            .filter(
                e =>
                    new Date(e.createdAt).toDateString() === today
            )
            .reduce(
                (sum, e) => sum + e.amount,
                0
            );

    const weeklyExpense =
        expenses
            .filter(
                e =>
                    new Date(e.createdAt) >= weekAgo
            )
            .reduce(
                (sum, e) => sum + e.amount,
                0
            );

    const monthlyExpense =
        expenses
            .filter(e => {

                const d = new Date(e.createdAt);

                return (
                    d.getMonth() === month &&
                    d.getFullYear() === year
                );

            })
            .reduce(
                (sum, e) => sum + e.amount,
                0
            );

    return {

        largestExpense,

        averageExpense,

        todayExpense,

        weeklyExpense,

        monthlyExpense

    };

};

module.exports = {
    getExpenseStatistics
};