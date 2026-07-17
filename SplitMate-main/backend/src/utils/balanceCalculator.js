const calculateBalances = (expenses) => {
  const balances = {};

  const addBalance = (userId, amount) => {
    if (!balances[userId]) balances[userId] = 0;
    balances[userId] += amount;
  };

  expenses.forEach((expense) => {
    const paidBy = expense.paidBy._id.toString();

    addBalance(paidBy, expense.amount);

    expense.splits.forEach((split) => {
      addBalance(split.user._id.toString(), -split.amount);
    });
  });

  return balances;
};

module.exports = {
  calculateBalances,
};