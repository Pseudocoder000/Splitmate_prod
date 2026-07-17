const simplifyDebts = (balances) => {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([user, balance]) => {
    if (balance < 0) {
      debtors.push({
        user,
        amount: -balance,
      });
    } else if (balance > 0) {
      creditors.push({
        user,
        amount: balance,
      });
    }
  });

  const transactions = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(
      debtors[i].amount,
      creditors[j].amount
    );

    transactions.push({
      from: debtors[i].user,
      to: creditors[j].user,
      amount: Number(pay.toFixed(2)),
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
};

module.exports = {
  simplifyDebts,
};