const Activity = require("../models/Activity");

class ActivityRepository {

    create(payload, session = null) {

        return Activity.create(
            [payload],
            { session }
        ).then(res => res[0]);

    }

    findByGroup(groupId, page = 1, limit = 20) {
        return Activity.find({
            group: groupId,
        })
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    }

    countByGroup(groupId) {

        return Activity.countDocuments({
            group: groupId,
        });

    }

    findRecent(limit = 10) {

        return Activity.find()
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 })
            .limit(limit);

    }

}

module.exports = new ActivityRepository();