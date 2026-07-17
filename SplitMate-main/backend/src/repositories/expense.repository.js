const Expense = require("../models/Expense");

class ExpenseRepository {

    create(data, session = null) {

        return Expense.create([data], { session }).then(res => res[0]);

    }

    findById(id) {

        return Expense.findById(id)
            .populate("paidBy", "name email")
            .populate("createdBy", "name email")
            .populate("splits.user", "name email");

    }

    findByGroup(groupId) {

        return Expense.find({ group: groupId })
            .sort({ createdAt: -1 });

    }

    update(id, data, session = null) {

        return Expense.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                session
            }
        )
            .populate("paidBy", "name email")
            .populate("createdBy", "name email")
            .populate("splits.user", "name email");

    }

    delete(id, session = null) {

        return Expense.findByIdAndDelete(id, {
            session
        });

    }

}

module.exports = new ExpenseRepository();