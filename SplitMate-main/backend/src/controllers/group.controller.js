const groupService = require("../services/group.service");
const { success } = require("../utils/response");

class GroupController {

    async createGroup(req, res, next) {
        try {
            const group = await groupService.createGroup(
                req.user._id,
                req.body
            );

            return success(res, group, 201);

        } catch (error) {
            next(error);
        }
    }

    async getMyGroups(req, res, next) {
        try {

            const groups = await groupService.getMyGroups(req.user._id);

            return success(res, groups);

        } catch (error) {
            next(error);
        }
    }

    async getGroup(req, res, next) {
        try {

            const group = await groupService.getGroup(
                req.params.groupId,
                req.user._id
            );

            return success(res, group);

        } catch (error) {
            next(error);
        }
    }

    async addMember(req, res, next) {
        try {

            const group = await groupService.addMember(
                req.params.groupId,
                req.user._id,
                req.body.email
            );

            return success(res, group);

        } catch (error) {
            next(error);
        }
    }

    async removeMember(req, res, next) {
        try {

            await groupService.removeMember(
                req.params.groupId,
                req.user._id,
                req.params.userId
            );

            return success(res, null);

        } catch (error) {
            next(error);
        }
    }

    async deleteGroup(req, res, next) {
        try {

            await groupService.deleteGroup(
                req.params.groupId,
                req.user._id
            );

            return success(res, null);

        } catch (error) {
            next(error);
        }
    }

}

module.exports = new GroupController();