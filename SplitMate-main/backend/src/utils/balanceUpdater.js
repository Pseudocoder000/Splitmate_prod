const balanceRepository = require("../repositories/balance.repository");

class BalanceUpdater {

    async updateBalance({
        groupId,
        lenderId,
        borrowerId,
        amount,
        session = null,
    }) {

        const group =
            groupId._id ? groupId._id : groupId;

        const lender =
            lenderId._id ? lenderId._id : lenderId;

        const borrower =
            borrowerId._id ? borrowerId._id : borrowerId;

        amount = Number(amount.toFixed(2));

        if (lender.toString() === borrower.toString()) {
            return;
        }

        const balance = await balanceRepository.find(
            group,
            lender,
            borrower,
            session
        );

        if (balance) {

            const newAmount = Number(
                (balance.amount + amount).toFixed(2)
            );

            if (newAmount <= 0) {

                await balanceRepository.delete(
                    balance._id,
                    session
                );

            } else {

                await balanceRepository.update(
                    balance._id,
                    newAmount,
                    session
                );

            }

            return;

        }

        const reverseBalance = await balanceRepository.find(
            group,
            borrower,
            lender,
            session
        );

        if (reverseBalance) {

            if (reverseBalance.amount > amount) {

                await balanceRepository.update(
                    reverseBalance._id,
                    Number(
                        (reverseBalance.amount - amount).toFixed(2)
                    ),
                    session
                );

            } else if (reverseBalance.amount < amount) {

                await balanceRepository.delete(
                    reverseBalance._id,
                    session
                );

                await balanceRepository.create(
                    {
                        group,
                        lender,
                        borrower,
                        amount: Number(
                            (amount - reverseBalance.amount).toFixed(2)
                        ),
                    },
                    session
                );

            } else {

                await balanceRepository.delete(
                    reverseBalance._id,
                    session
                );

            }

            return;

        }

        await balanceRepository.create(
            {
                group,
                lender,
                borrower,
                amount,
            },
            session
        );

    }

    async addExpense(expense, session = null) {

        const paidBy =
            expense.paidBy._id
                ? expense.paidBy._id
                : expense.paidBy;

        for (const split of expense.splits) {

            const user =
                split.user._id
                    ? split.user._id
                    : split.user;

            if (user.toString() === paidBy.toString()) {
                continue;
            }

            await this.updateBalance({
                groupId: expense.group,
                lenderId: paidBy,
                borrowerId: user,
                amount: split.amount,
                session,
            });

        }

    }

    async removeExpense(expense, session = null) {

        const paidBy =
            expense.paidBy._id
                ? expense.paidBy._id
                : expense.paidBy;

        for (const split of expense.splits) {

            const user =
                split.user._id
                    ? split.user._id
                    : split.user;

            if (user.toString() === paidBy.toString()) {
                continue;
            }

            await this.updateBalance({
                groupId: expense.group,
                lenderId: user,
                borrowerId: paidBy,
                amount: split.amount,
                session,
            });

        }

    }

    async settle(settlement, session = null) {

        await this.updateBalance({
            groupId: settlement.group,
            lenderId: settlement.to,
            borrowerId: settlement.from,
            amount: settlement.amount,
            session,
        });

    }

}

module.exports = new BalanceUpdater();