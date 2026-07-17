const dashboardRepository = require("../repositories/dashboard.repository");

class DashboardService {

    async getDashboard(userId) {

        const [
            summary,
            groups,
            recentExpenses,
            recentActivities,
            pendingBalances,
        ] = await Promise.all([

            dashboardRepository.getDashboardSummary(userId),

            dashboardRepository.getUserGroups(userId),

            dashboardRepository.getRecentExpenses(userId),

            dashboardRepository.getRecentActivities(userId),

            dashboardRepository.getPendingBalances(userId),

        ]);

        return {

            summary,

            groups,

            recentExpenses,

            recentActivities,

            pendingBalances,

        };

    }

}

module.exports = new DashboardService();