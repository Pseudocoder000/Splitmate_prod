const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Balance = require("../models/Balance");
const Activity = require("../models/Activity");

class DashboardRepository {

    async getUserGroups(userId) {

        return Group.find({
            "members.user": userId,
        })
            .populate("members.user", "name email")
            .lean();

    }

    async getGroupExpenseSummary(groupIds) {

        if (!groupIds.length) {
            return [];
        }

        return Expense.aggregate([
            {
                $match: {
                    group: {
                        $in: groupIds,
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $group: {

                    _id: "$group",

                    expenseCount: {
                        $sum: 1,
                    },

                    totalExpense: {
                        $sum: "$amount",
                    },

                    lastExpenseTitle: {
                        $first: "$title",
                    },

                    lastExpenseAmount: {
                        $first: "$amount",
                    },

                    lastExpenseAt: {
                        $first: "$createdAt",
                    },

                },
            },
        ]);

    }

    async getGroupBalances(groupIds) {

        if (!groupIds.length) {
            return [];
        }

        return Balance.find({
            group: {
                $in: groupIds,
            },
            amount: {
                $gt: 0,
            },
        })
            .populate("group", "name")
            .populate("lender", "name email")
            .populate("borrower", "name email")
            .lean();

    }

    async getRecentExpenses(groupIds, limit = 5) {

        if (!groupIds.length) {
            return [];
        }

        return Expense.find({
            group: {
                $in: groupIds,
            },
        })
            .populate("group", "name")
            .populate("paidBy", "name email")
            .sort({
                createdAt: -1,
            })
            .limit(limit)
            .lean();

    }

    async getRecentActivities(groupIds, limit = 5) {

        if (!groupIds.length) {
            return [];
        }

        return Activity.find({
            group: {
                $in: groupIds,
            },
        })
            .populate("group", "name")
            .populate("performedBy", "name email")
            .sort({
                createdAt: -1,
            })
            .limit(limit)
            .lean();

    }

    async getSummaryStatistics(userId, groupIds) {

        const [
            totalGroups,
            totalExpenses,
            totalSpent,
            balances,
        ] = await Promise.all([

            Group.countDocuments({
                "members.user": userId,
            }),

            Expense.countDocuments({
                group: {
                    $in: groupIds,
                },
            }),

            Expense.aggregate([
                {
                    $match: {
                        group: {
                            $in: groupIds,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),

            Balance.find({
                $or: [
                    {
                        lender: userId,
                    },
                    {
                        borrower: userId,
                    },
                ],
            }).lean(),

        ]);

        return {

            totalGroups,

            totalExpenses,

            totalSpent: totalSpent[0]?.total || 0,

            balances,

        };

    }

}

module.exports = new DashboardRepository();