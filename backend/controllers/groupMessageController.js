const mongoose = require('mongoose');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');

const requireGroupMember = async ({ groupId, userId }) => {
  const group = await Group.findById(groupId).select('_id members').lean();
  if (!group) {
    const error = new Error('Group not found.');
    error.status = 404;
    throw error;
  }

  const members = Array.isArray(group.members) ? group.members : [];
  const isMember = members.some((memberId) => String(memberId) === String(userId));
  if (!isMember) {
    const error = new Error('You do not have access to this group.');
    error.status = 403;
    throw error;
  }
};

const listGroupMessages = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params?.groupId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    await requireGroupMember({ groupId, userId });

    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

const createGroupMessage = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params?.groupId;
    const text = String(req.body?.text || '').trim();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!text) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    if (text.length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or less.' });
    }

    await requireGroupMember({ groupId, userId });

    const senderLabel = String(req.user?.name || req.user?.email || 'User');

    const message = await GroupMessage.create({
      groupId,
      senderId: userId,
      senderLabel,
      text,
    });

    res.status(201).json({ message: 'Message posted.', created: message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listGroupMessages,
  createGroupMessage,
};
