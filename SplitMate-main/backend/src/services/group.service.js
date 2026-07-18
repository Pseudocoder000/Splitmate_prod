const groupRepository = require("../repositories/group.repository");
const userRepository = require("../repositories/user.repository");
const activityService = require("./activity.service");
const ACTIVITY = require("../constants/activityType");

const { AppError } = require("../utils/errors");
const ERROR_CODES = require("../constants/errorCodes");
const { OWNER, MEMBER } = require("../constants/roles");

class GroupService {
  async createGroup(userId, body) {
    const group = await groupRepository.create({
      name: body.name,
      owner: userId,
      members: [
        {
          user: userId,
          role: OWNER,
          joinedAt: new Date(),
        },
      ],
    });

    await activityService.logActivity({
      group: group._id,
      performedBy: userId,
      type: ACTIVITY.GROUP_CREATED,
      description: `Group "${group.name}" was created.`,
    });

    return await groupRepository.findById(group._id);
  }

  async getMyGroups(userId) {
    return await groupRepository.findUserGroups(userId);
  }

  async getGroup(groupId, userId) {
    const group = await groupRepository.findById(groupId);

    if (!group) {
      throw new AppError("Group not found.", 404, ERROR_CODES.NOT_FOUND);
    }

    const isMember = group.members.some(
      (member) => member.user._id.toString() === userId.toString(),
    );

    if (!isMember) {
      throw new AppError(
        "You are not a member of this group.",
        403,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    return group;
  }

  async addMember(groupId, ownerId, email) {
    const group = await groupRepository.findById(groupId);

    if (!group) {
      throw new AppError("Group not found.", 404, ERROR_CODES.NOT_FOUND);
    }

    if (group.owner._id.toString() !== ownerId.toString()) {
      throw new AppError(
        "Only group owner can add members.",
        403,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("User not found.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const alreadyExists = group.members.some(
      (member) => member.user._id.toString() === user._id.toString(),
    );

    if (alreadyExists) {
      throw new AppError(
        "User is already a member.",
        400,
        "USER_ALREADY_MEMBER",
      );
    }

    group.members.push({
      user: user._id,
      role: MEMBER,
      joinedAt: new Date(),
    });

    await group.save();

    await activityService.logActivity({
      group: group._id,
      performedBy: ownerId,
      type: ACTIVITY.MEMBER_ADDED,
      description: `${user.name} was added to the group.`,
    });

    return await groupRepository.findById(group._id);
  }

  async removeMember(groupId, ownerId, memberId) {
    const group = await groupRepository.findById(groupId);

    if (!group) {
      throw new AppError("Group not found.", 404, ERROR_CODES.NOT_FOUND);
    }

    if (group.owner._id.toString() !== ownerId.toString()) {
      throw new AppError(
        "Only owner can remove members.",
        403,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    if (group.owner._id.toString() === memberId.toString()) {
      throw new AppError(
        "Owner cannot remove himself.",
        400,
        "OWNER_REMOVE_NOT_ALLOWED",
      );
    }

    const member = group.members.find(
      (m) => m.user._id.toString() === memberId.toString(),
    );

    if (!member) {
      throw new AppError("Member not found.", 404, "MEMBER_NOT_FOUND");
    }

    /*
        Later

        BalanceService.checkZeroBalance()

        if balance != 0

        throw error

    */

    group.members = group.members.filter(
      (m) => m.user._id.toString() !== memberId.toString(),
    );

    await group.save();

    await activityService.logActivity({
      group: group._id,
      performedBy: ownerId,
      type: ACTIVITY.MEMBER_REMOVED,
      description: `A member was removed from the group.`,
    });

    return group;
  }

  async deleteGroup(groupId, ownerId) {
    const group = await groupRepository.findById(groupId);

    if (!group) {
      throw new AppError("Group not found.", 404, ERROR_CODES.NOT_FOUND);
    }

    if (group.owner._id.toString() !== ownerId.toString()) {
      throw new AppError(
        "Only owner can delete group.",
        403,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    await groupRepository.deleteGroup(groupId);

    await activityService.logActivity({
      group: group._id,
      performedBy: ownerId,
      type: ACTIVITY.GROUP_DELETED,
      description: `Group "${group.name}" was deleted.`,
    });

    return null;
  }
}

module.exports = new GroupService();
