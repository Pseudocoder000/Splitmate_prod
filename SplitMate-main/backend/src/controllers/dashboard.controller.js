const dashboardService = require("../services/dashboard.service");

class DashboardController {

    async getDashboard(req, res, next) {

        try {

            const dashboard = await dashboardService.getDashboard(
                req.user._id
            );

            return res.status(200).json({

                success: true,

                data: dashboard,

            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new DashboardController();