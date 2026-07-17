const activityRepository = require("../repositories/activity.repository");
const activityService = require("../services/activity.service");

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
      session,
    );
  }

  async getGroupActivities(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await activityService.getGroupActivities(
        req.params.groupId,
        page,
        limit,
      );

      res.json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecentActivities(limit = 10) {
    return activityRepository.findRecent(limit);
  }
}

module.exports = new ActivityService();
