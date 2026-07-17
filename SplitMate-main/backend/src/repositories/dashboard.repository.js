const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Balance = require("../models/Balance");
const Activity = require("../models/Activity");

class DashboardRepository {
  async getUserGroups(userId) {
    return Group.find({
      members: userId,
    })
      .select("name currency members createdAt")
      .sort({ createdAt: -1 });
  }

  async getRecentExpenses(userId, limit = 5) {
    return Expense.find({
      paidBy: userId,
    })
      .populate("group", "name")
      .populate("paidBy", "name email")
      .sort({ createdAt: -1})
      .limit(limit);
  }

  async getRecentActivities(userId, limit = 5) {
    const groups = await Group.find({
      members: userId,
    }).select("_id");

    const groupIds = groups.map((group) => group._id);

    return Activity.find({
      group: {
        $in: groupIds,
      },
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getPendingBalances(userId) {
    return Balance.find({
      $or: [
        { lender: userId },
        { borrower: userId },
      ],
      amount: {
        $gt: 0,
      },
    })
      .populate("lender", "name email")
      .populate("borrower", "name email")
      .populate("group", "name");
  }

  async getDashboardSummary(userId) {
    const [totalGroups, totalExpenses, totalSpent, balances] =
      await Promise.all([
        Group.countDocuments({
          members: userId,
        }),

        Expense.countDocuments({
          paidBy: userId,
        }),

        Expense.aggregate([
          {
            $match: {
              paidBy: userId,
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
            { lender: userId },
            { borrower: userId },
          ],
        }),
      ]);

    let youOwe = 0;
    let youAreOwed = 0;

    balances.forEach((balance) => {
      // Logged-in user borrowed money
      if (balance.borrower.toString() === userId.toString()) {
        youOwe += balance.amount;
      }

      // Logged-in user lent money
      if (balance.lender.toString() === userId.toString()) {
        youAreOwed += balance.amount;
      }
    });

    return {
      totalGroups,
      totalExpenses,
      totalSpent: totalSpent[0]?.total || 0,
      youOwe,
      youAreOwed,
      netBalance: youAreOwed - youOwe,
    };
  }
}

module.exports = new DashboardRepository();