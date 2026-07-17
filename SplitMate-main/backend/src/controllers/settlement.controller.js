const settlementService = require("../services/settlement.service");

class SettlementController {

    async createSettlement(req, res, next) {

        try {

            const settlement = await settlementService.createSettlement(
                req.body
            );

            res.status(201).json({
                success: true,
                data: settlement
            });

        } catch (error) {

            next(error);

        }

    }

    async getGroupSettlements(req, res, next) {

        try {

            const settlements = await settlementService.getGroupSettlements(
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

    async getUserSettlements(req, res, next) {

        try {

            const settlements = await settlementService.getUserSettlements(
                req.user.id
            );

            res.json({
                success: true,
                data: settlements
            });

        } catch (error) {

            next(error);

        }

    }

    async deleteSettlement(req, res, next) {

        try {

            await settlementService.deleteSettlement(
                req.params.id
            );

            res.json({
                success: true,
                message: "Settlement deleted successfully."
            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new SettlementController();