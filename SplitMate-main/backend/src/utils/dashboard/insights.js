const generateInsights = (
    summary,
    expenseStats
) => {

    const insights = [];

    if (summary.totalToPay > 0)
        insights.push(
            `You owe ₹${summary.totalToPay}.`
        );

    if (summary.totalToReceive > 0)
        insights.push(
            `You should receive ₹${summary.totalToReceive}.`
        );

    if (expenseStats.largestExpense)
        insights.push(
            `Your largest expense is "${expenseStats.largestExpense.title}".`
        );

    if (expenseStats.monthlyExpense > 0)
        insights.push(
            `You spent ₹${expenseStats.monthlyExpense} this month.`
        );

    return insights;

};

module.exports = {
    generateInsights
};