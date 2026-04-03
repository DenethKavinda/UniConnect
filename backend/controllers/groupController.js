const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const GroupFile = require('../models/GroupFile');
const GroupMessage = require('../models/GroupMessage');
const { PROTECTED_UPLOAD_ROOT, ensureUploadDir } = require('./groupFileController');

const toClientGroup = (group, currentUserId) => {
  const members = Array.isArray(group.members) ? group.members : [];
  const pendingRequests = Array.isArray(group.pendingRequests) ? group.pendingRequests : [];
  const memberCount = members.length;
  const isJoined = currentUserId
    ? members.some((memberId) => String(memberId) === String(currentUserId))
    : false;
  const hasPendingRequest = currentUserId
    ? pendingRequests.some((requestId) => String(requestId) === String(currentUserId))
    : false;

  const privacyType = group.privacyType || group.privacy || 'public';
  const modules = group.features || group.modules || {
    sharedMaterials: true,
    discussionForum: true,
    taskTracker: false,
  };

  return {
    _id: group._id,
    groupName: group.groupName,
    memberCount,
    memberLimit: typeof group.memberLimit === 'number' ? group.memberLimit : undefined,
    facultyTag: group.facultyTag,
    isJoined,
    createdBy: group.createdBy,
    privacyType,
    hasPendingRequest,
    modules,
  };
};

const deleteGroup = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const role = req.user?.role;
    const groupId = req.params?.groupId;

    if (!requesterId || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    const group = await Group.findById(groupId).select('_id createdBy').lean();
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isCreator = String(group.createdBy) === String(requesterId);
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator can delete this group.' });
    }

    // Best-effort cleanup of shared files.
    const files = await GroupFile.find({ groupId }).select('_id storedName').lean();
    ensureUploadDir();

    for (const file of files) {
      if (!file?.storedName) continue;
      const filePath = path.join(PROTECTED_UPLOAD_ROOT, file.storedName);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // ignore file-system errors; still proceed with DB cleanup
      }
    }

    await GroupFile.deleteMany({ groupId });
    await GroupMessage.deleteMany({ groupId });
    await Group.deleteOne({ _id: groupId });

    res.json({ message: 'Group deleted.' });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;

    // Hide private groups from global discovery unless user is a member or the creator.
    const groups = await Group.find({
      $or: [
        { $and: [{ privacyType: { $ne: 'private' } }, { privacy: { $ne: 'private' } }] },
        ...(currentUserId
          ? [
              { createdBy: currentUserId },
              { members: currentUserId },
            ]
          : []),
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
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
      privacyType,
      memberLimit,
      avatarPreset,
      avatarFileName,
      features,
      modules
    } = req.body || {};

    if (!groupName || !moduleSubject || !description) {
      return res.status(400).json({ message: 'Group name, module subject, and description are required.' });
    }

    const group = await Group.create({
      groupName: String(groupName).trim(),
      moduleSubject: String(moduleSubject).trim().toUpperCase(),
      facultyTag: facultyTag ? String(facultyTag).trim() : 'General',
      description: String(description).trim(),
      privacy: privacyType || privacy,
      privacyType: privacyType || privacy,
      memberLimit,
      avatarPreset,
      avatarFileName,
      features: features || modules,
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

    const privacyType = group.privacyType || group.privacy || 'public';

    const isAlreadyMember = group.members.some((memberId) => String(memberId) === String(userId));
    if (!isAlreadyMember) {
      if (privacyType === 'request') {
        const pending = Array.isArray(group.pendingRequests) ? group.pendingRequests : [];
        const isAlreadyPending = pending.some((requestId) => String(requestId) === String(userId));
        if (!isAlreadyPending) {
          group.pendingRequests = [...pending, userId];
          await group.save();
        }

        return res.json({
          message: 'Request sent. Waiting for creator approval.',
          pendingRequest: true,
          group: toClientGroup(group.toObject(), userId),
        });
      }

      if (group.memberLimit && group.members.length >= group.memberLimit) {
        return res.status(403).json({ message: 'This squad is full.' });
      }
      group.members.push(userId);
      await group.save();
    }

    res.json({ message: 'Joined group successfully.', group: toClientGroup(group.toObject(), userId) });
  } catch (error) {
    next(error);
  }
};

const listPendingRequests = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const role = req.user?.role;
    const groupId = req.params?.groupId;

    if (!requesterId || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    const group = await Group.findById(groupId).populate('pendingRequests', 'name email').lean();
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isCreator = String(group.createdBy) === String(requesterId);
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator can manage requests.' });
    }

    const requests = Array.isArray(group.pendingRequests) ? group.pendingRequests : [];
    res.json({
      requests: requests.map((u) => ({ _id: u._id, name: u.name, email: u.email })),
    });
  } catch (error) {
    next(error);
  }
};

const approvePendingRequest = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const role = req.user?.role;
    const groupId = req.params?.groupId;
    const targetUserId = req.params?.userId;

    if (!requesterId || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isCreator = String(group.createdBy) === String(requesterId);
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator can manage requests.' });
    }

    const pending = Array.isArray(group.pendingRequests) ? group.pendingRequests : [];
    const isPending = pending.some((id) => String(id) === String(targetUserId));
    if (!isPending) {
      return res.status(404).json({ message: 'No pending request for this user.' });
    }

    if (group.memberLimit && group.members.length >= group.memberLimit) {
      return res.status(400).json({ message: 'Group member limit reached.' });
    }

    group.pendingRequests = pending.filter((id) => String(id) !== String(targetUserId));
    const isAlreadyMember = group.members.some((id) => String(id) === String(targetUserId));
    if (!isAlreadyMember) {
      group.members.push(targetUserId);
    }

    await group.save();

    res.json({
      message: 'Request approved.',
      group: toClientGroup(group.toObject(), requesterId),
    });
  } catch (error) {
    next(error);
  }
};

const rejectPendingRequest = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const role = req.user?.role;
    const groupId = req.params?.groupId;
    const targetUserId = req.params?.userId;

    if (!requesterId || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isCreator = String(group.createdBy) === String(requesterId);
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator can manage requests.' });
    }

    const pending = Array.isArray(group.pendingRequests) ? group.pendingRequests : [];
    const wasPending = pending.some((id) => String(id) === String(targetUserId));
    if (!wasPending) {
      return res.status(404).json({ message: 'No pending request for this user.' });
    }

    group.pendingRequests = pending.filter((id) => String(id) !== String(targetUserId));
    await group.save();

    const user = await User.findById(targetUserId).select('name email').lean();

    res.json({
      message: 'Request rejected.',
      rejectedUser: user ? { _id: user._id, name: user.name, email: user.email } : { _id: targetUserId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  createGroup,
  joinGroup,
  listPendingRequests,
  approvePendingRequest,
  rejectPendingRequest,
  deleteGroup
};
