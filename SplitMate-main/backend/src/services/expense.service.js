const expenseRepository = require("../repositories/expense.repository");
const groupRepository = require("../repositories/group.repository");

const balanceUpdater = require("../utils/balanceUpdater");
const activityService = require("./activity.service");

const ACTIVITY = require("../constants/activityType");

const { AppError } = require("../utils/errors");
const { emitGroupUpdate } = require("../sockets/socketHandlers");

class ExpenseService {
  async createExpense(data, userId) {
    const group = await groupRepository.findById(data.groupId);

    if (!group) {
      throw new AppError("Group not found.", 404, "GROUP_NOT_FOUND");
    }

    const memberIds = group.members.map((member) =>
      (member.user._id || member.user).toString(),
    );

    if (!memberIds.includes(userId.toString())) {
      throw new AppError(
        "You are not a member of this group.",
        403,
        "NOT_GROUP_MEMBER",
      );
    }

    if (!memberIds.includes(data.paidBy.toString())) {
      throw new AppError("Payer must be a group member.", 400, "INVALID_PAYER");
    }

    let splits = [];

    switch (data.splitType) {
      case "EQUAL": {
        const equalAmount = Number(
          (data.amount / data.splits.length).toFixed(2),
        );

        splits = data.splits.map((split) => ({
          user: split.user,
          amount: equalAmount,
          percentage: 0,
        }));

        break;
      }

      case "EXACT": {
        const total = data.splits.reduce(
          (sum, split) => sum + Number(split.amount),
          0,
        );

        if (Number(total.toFixed(2)) !== Number(data.amount)) {
          throw new AppError(
            "Split amounts do not match expense amount.",
            400,
            "INVALID_SPLIT",
          );
        }

        splits = data.splits;

        break;
      }

      case "PERCENTAGE": {
        const totalPercentage = data.splits.reduce(
          (sum, split) => sum + Number(split.percentage),
          0,
        );

        if (totalPercentage !== 100) {
          throw new AppError(
            "Total percentage must be 100.",
            400,
            "INVALID_PERCENTAGE",
          );
        }

        splits = data.splits.map((split) => ({
          user: split.user,
          percentage: split.percentage,
          amount: Number(((data.amount * split.percentage) / 100).toFixed(2)),
        }));

        break;
      }

      default:
        throw new AppError("Invalid split type.", 400, "INVALID_SPLIT_TYPE");
    }

    const expense = await expenseRepository.create({
      group: data.groupId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      expenseType: data.expenseType,
      paidBy: data.paidBy,
      splitType: data.splitType,
      splits,
      createdBy: userId,
    });

    await balanceUpdater.addExpense(expense);

    await activityService.logActivity({
      group: expense.group,
      performedBy: userId,
      type: ACTIVITY.EXPENSE_CREATED,
      description: `Created expense "${expense.title}"`,
      metadata: {
        expenseId: expense._id,
      },
    });

    emitGroupUpdate(expense.group);

    return expense;
  }

  getExpense(id) {
    return expenseRepository.findById(id);
  }

  getGroupExpenses(groupId) {
    return expenseRepository.findByGroup(groupId);
  }

  async updateExpense(id, data) {
    const oldExpense = await expenseRepository.findById(id);

    if (!oldExpense) {
      throw new AppError("Expense not found.", 404, "EXPENSE_NOT_FOUND");
    }

    await balanceUpdater.removeExpense(oldExpense);

    let splits = [];

      switch (data.splitType) {
        case "EQUAL": {
          const equalAmount = Number(
            (data.amount / data.splits.length).toFixed(2),
          );

          splits = data.splits.map((split) => ({
            user: split.user,
            amount: equalAmount,
            percentage: 0,
          }));

          break;
        }

        case "EXACT": {
          const total = data.splits.reduce(
            (sum, split) => sum + Number(split.amount),
            0,
          );

          if (Number(total.toFixed(2)) !== Number(data.amount)) {
            throw new AppError(
              "Split amounts do not match expense amount.",
              400,
              "INVALID_SPLIT",
            );
          }

          splits = data.splits;

          break;
        }

        case "PERCENTAGE": {
          const percentage = data.splits.reduce(
            (sum, split) => sum + Number(split.percentage),
            0,
          );

          if (percentage !== 100) {
            throw new AppError(
              "Total percentage must be 100.",
              400,
              "INVALID_PERCENTAGE",
            );
          }

          splits = data.splits.map((split) => ({
            user: split.user,
            percentage: split.percentage,
            amount: Number(((data.amount * split.percentage) / 100).toFixed(2)),
          }));

          break;
        }

        default:
          throw new AppError("Invalid split type.", 400, "INVALID_SPLIT_TYPE");
      }

    const updatedExpense = await expenseRepository.update(id, {
      title: data.title,
      description: data.description,
      amount: data.amount,
      expenseType: data.expenseType,
      paidBy: data.paidBy,
      splitType: data.splitType,
      splits,
    });

    await balanceUpdater.addExpense(updatedExpense);

    await activityService.logActivity({
      group: updatedExpense.group,
      performedBy: updatedExpense.paidBy._id || updatedExpense.paidBy,
      type: ACTIVITY.EXPENSE_UPDATED,
      description: `Updated expense "${updatedExpense.title}"`,
      metadata: {
        expenseId: updatedExpense._id,
      },
    });

    emitGroupUpdate(updatedExpense.group);

    return updatedExpense;
  }

  async deleteExpense(id) {
    const expense = await expenseRepository.findById(id);

    if (!expense) {
      throw new AppError("Expense not found.", 404, "EXPENSE_NOT_FOUND");
    }

    await balanceUpdater.removeExpense(expense);

    await expenseRepository.delete(id);

    await activityService.logActivity({
      group: expense.group,
      performedBy: expense.paidBy._id || expense.paidBy,
      type: ACTIVITY.EXPENSE_DELETED,
      description: `Deleted expense "${expense.title}"`,
      metadata: {
        expenseId: expense._id,
      },
    });

    emitGroupUpdate(expense.group);

    return {
      message: "Expense deleted successfully.",
    };
  }
}

module.exports = new ExpenseService();
