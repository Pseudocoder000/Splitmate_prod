const expenseService = require("../services/expense.service");

class ExpenseController {

    async create(req, res, next) {

        try {

            const expense = await expenseService.createExpense(
                req.body,
                req.user._id
            );

            res.status(201).json({
                success: true,
                data: expense
            });

        } catch (error) {

            next(error);

        }

    }

    async getById(req, res, next) {

        try {

            const expense = await expenseService.getExpense(req.params.id);

            res.json({
                success: true,
                data: expense
            });

        } catch (error) {

            next(error);

        }

    }

    async getGroupExpenses(req, res, next) {

        try {

            const expenses = await expenseService.getGroupExpenses(
                req.params.groupId
            );

            res.json({
                success: true,
                data: expenses
            });

        } catch (error) {

            next(error);

        }

    }

    async update(req, res, next) {

        try {

            const expense = await expenseService.updateExpense(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data: expense
            });

        } catch (error) {

            next(error);

        }

    }

    async delete(req, res, next) {

        try {

            await expenseService.deleteExpense(req.params.id);

            res.json({
                success: true,
                data: null
            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new ExpenseController();