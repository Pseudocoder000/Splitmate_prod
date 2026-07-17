const balanceService = require("../services/balance.service");

class BalanceController {

    async getGroupBalances(req, res, next) {

        try {

            const balances = await balanceService.getGroupBalances(
                req.params.groupId
            );

            res.json({
                success: true,
                data: balances
            });

        } catch (error) {

            next(error);

        }

    }

    async getSettlements(req, res, next) {

        try {

            const settlements = await balanceService.getSettlements(
                req.params.groupId
            );

            res.json({
                success: true,
                data: settlements
            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new BalanceController();