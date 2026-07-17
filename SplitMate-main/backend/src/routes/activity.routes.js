const express = require("express");

const activityController = require("../controllers/activity.controller");

const auth = require("../middleware/auth");

const router = express.Router();

router.get(
    "/recent",
    auth,
    activityController.getRecentActivities
);

router.get(
    "/groups/:groupId",
    auth,
    activityController.getGroupActivities
);

module.exports = router;