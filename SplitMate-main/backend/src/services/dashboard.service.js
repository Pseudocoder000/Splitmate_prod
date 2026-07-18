const dashboardRepository = require("../repositories/dashboard.repository");

class DashboardService {
  async getDashboard(userId) {
    const groups = await dashboardRepository.getUserGroups(userId);

    const groupIds = groups.map((group) => group._id);

    const [
      summaryData,
      groupExpenseSummary,
      groupBalances,
      recentExpenses,
      recentActivities,
    ] = await Promise.all([
      dashboardRepository.getSummaryStatistics(userId, groupIds),

      dashboardRepository.getGroupExpenseSummary(groupIds),

      dashboardRepository.getGroupBalances(groupIds),

      dashboardRepository.getRecentExpenses(groupIds),

      dashboardRepository.getRecentActivities(groupIds),
    ]);

    return {
      summary: this.buildSummary(userId, summaryData),

      groups: this.buildGroups(
        userId,
        groups,
        groupExpenseSummary,
        groupBalances,
      ),

      recentExpenses: this.buildRecentExpenses(recentExpenses),

      recentActivities: this.buildRecentActivities(recentActivities),

      pendingBalances: this.buildPendingBalances(userId, groupBalances),
    };
  }

  buildSummary(userId, summaryData) {
    let youOwe = 0;

    let youAreOwed = 0;

    for (const balance of summaryData.balances) {
      if (balance.borrower.toString() === userId.toString()) {
        youOwe += balance.amount;
      }

      if (balance.lender.toString() === userId.toString()) {
        youAreOwed += balance.amount;
      }
    }

    return {
      totalGroups: summaryData.totalGroups,

      totalExpenses: summaryData.totalExpenses,

      totalSpent: summaryData.totalSpent,

      youOwe,

      youAreOwed,

      netBalance: youAreOwed - youOwe,
    };
  }
  buildGroups(userId, groups, groupExpenseSummary, groupBalances) {
    const expenseMap = new Map();

    groupExpenseSummary.forEach((group) => {
      expenseMap.set(group._id.toString(), group);
    });

    return groups.map((group) => {
      const stats = expenseMap.get(group._id.toString()) || {};

      let yourBalance = 0;

      for (const balance of groupBalances) {
        if (balance.group._id.toString() !== group._id.toString()) {
          continue;
        }

        if (balance.lender._id.toString() === userId.toString()) {
          yourBalance += balance.amount;
        }

        if (balance.borrower._id.toString() === userId.toString()) {
          yourBalance -= balance.amount;
        }
      }

      return {
        _id: group._id,

        name: group.name,

        memberCount: group.members.length,

        expenseCount: stats.expenseCount || 0,

        totalExpense: stats.totalExpense || 0,

        yourBalance,

        lastExpenseTitle: stats.lastExpenseTitle || null,

        lastExpenseAmount: stats.lastExpenseAmount || 0,

        lastExpenseAt: stats.lastExpenseAt || null,

        createdAt: group.createdAt,
      };
    });
  }
  buildRecentExpenses(expenses) {
    return expenses.map((expense) => ({
      _id: expense._id,

      title: expense.title,

      description: expense.description,

      amount: expense.amount,

      expenseType: expense.expenseType,

      group: {
        _id: expense.group._id,

        name: expense.group.name,
      },

      paidBy: {
        _id: expense.paidBy._id,

        name: expense.paidBy.name,

        email: expense.paidBy.email,
      },

      createdAt: expense.createdAt,
    }));
  }

  buildRecentActivities(activities) {
    return activities.map((activity) => ({
      _id: activity._id,

      type: activity.type,

      description: activity.description,

      group: {
        _id: activity.group._id,

        name: activity.group.name,
      },

      performedBy: {
        _id: activity.performedBy._id,

        name: activity.performedBy.name,

        email: activity.performedBy.email,
      },

      metadata: activity.metadata,

      createdAt: activity.createdAt,
    }));
  }
  buildPendingBalances(userId, balances) {
    return balances.map((balance) => {
      const isLender = balance.lender._id.toString() === userId.toString();

      return {
        _id: balance._id,

        group: {
          _id: balance.group._id,

          name: balance.group.name,
        },

        amount: balance.amount,

        direction: isLender ? "RECEIVE" : "PAY",

        person: isLender
          ? {
              _id: balance.borrower._id,
              name: balance.borrower.name,
              email: balance.borrower.email,
            }
          : {
              _id: balance.lender._id,
              name: balance.lender.name,
              email: balance.lender.email,
            },

        createdAt: balance.createdAt,
      };
    });
  }
}

module.exports = new DashboardService();
