const mongoose = require('mongoose');
const Group = require('../models/Group');

const toClientGroup = (group, currentUserId) => {
  const members = Array.isArray(group.members) ? group.members : [];
  const memberCount = members.length;
  const isJoined = currentUserId
    ? members.some((memberId) => String(memberId) === String(currentUserId))
    : false;

  return {
    _id: group._id,
    groupName: group.groupName,
    memberCount,
    facultyTag: group.facultyTag,
    isJoined
  };
};

const getGroups = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const groups = await Group.find().sort({ createdAt: -1 }).lean();
    const payload = groups.map((group) => toClientGroup(group, currentUserId));
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      groupName,
      moduleSubject,
      facultyTag,
      description,
      privacy,
      memberLimit,
      avatarPreset,
      avatarFileName,
      features
    } = req.body || {};

    if (!groupName || !moduleSubject || !description) {
      return res.status(400).json({ message: 'Group name, module subject, and description are required.' });
    }

    const group = await Group.create({
      groupName: String(groupName).trim(),
      moduleSubject: String(moduleSubject).trim().toUpperCase(),
      facultyTag: facultyTag ? String(facultyTag).trim() : 'General',
      description: String(description).trim(),
      privacy,
      memberLimit,
      avatarPreset,
      avatarFileName,
      features,
      createdBy: userId,
      members: [userId]
    });

    res.status(201).json({
      message: 'Group created successfully.',
      group: toClientGroup(group.toObject(), userId)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'You already created a similar group for this module.' });
    }
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params?.groupId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isAlreadyMember = group.members.some((memberId) => String(memberId) === String(userId));
    if (!isAlreadyMember) {
      if (group.memberLimit && group.members.length >= group.memberLimit) {
        return res.status(400).json({ message: 'Group member limit reached.' });
      }
      group.members.push(userId);
      await group.save();
    }

    res.json({ message: 'Joined group successfully.', group: toClientGroup(group.toObject(), userId) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  createGroup,
  joinGroup
};
