const activityRepository = require("../repositories/activity.repository");

class ActivityService {

    async logActivity({
        group,
        performedBy,
        type,
        description,
        metadata = {},
        session = null,
    }) {

        return activityRepository.create(
            {
                group,
                performedBy,
                type,
                description,
                metadata,
            },
            session
        );

    }

    async getGroupActivities(groupId, page = 1, limit = 20) {

        const [activities, total] = await Promise.all([

            activityRepository.findByGroup(
                groupId,
                page,
                limit
            ),

            activityRepository.countByGroup(
                groupId
            )

        ]);

        return {

            activities,

            pagination: {

                total,

                page,

                limit,

                totalPages: Math.ceil(total / limit),

            },

        };

    }

    async getRecentActivities(limit = 10) {

        return activityRepository.findRecent(limit);

    }

}

module.exports = new ActivityService();