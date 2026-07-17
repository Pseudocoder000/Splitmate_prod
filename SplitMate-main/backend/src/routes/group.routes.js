const express = require("express");

const authMiddleware = require("../middleware/auth");

const groupController = require("../controllers/group.controller");

const {
    createGroupValidation,
    addMemberValidation,
    validate
} = require("../validations/group.validation");

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/",
    createGroupValidation,
    validate,
    groupController.createGroup
);

router.get(
    "/",
    groupController.getMyGroups
);

router.get(
    "/:groupId",
    groupController.getGroup
);

router.post(
    "/:groupId/members",
    addMemberValidation,
    validate,
    groupController.addMember
);

router.delete(
    "/:groupId/members/:userId",
    groupController.removeMember
);

router.delete(
    "/:groupId",
    groupController.deleteGroup
);

module.exports = router;