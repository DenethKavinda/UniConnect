const mongoose = require('mongoose');
const Group = require('../models/Group');

const ensureCanAccessWorkspace = (group, requesterId, role) => {
  const isAdmin = role === 'admin';
  const isCreator = String(group.createdBy) === String(requesterId);
  const isMember = Array.isArray(group.members)
    ? group.members.some((id) => String(id) === String(requesterId))
    : false;

  return { isAdmin, isCreator, isMember, allowed: isAdmin || isCreator || isMember };
};

const toClientTask = (task) => ({
  _id: task._id,
  title: task.title,
  priority: task.priority,
  date: task.date,
  completed: Boolean(task.completed),
  createdBy: task.createdBy,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const toClientReminder = (rem) => ({
  _id: rem._id,
  text: rem.text,
  createdBy: rem.createdBy,
  createdAt: rem.createdAt,
  updatedAt: rem.updatedAt,
});

const getWorkspace = async (req, res, next) => {
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

    const group = await Group.findById(groupId).select('_id createdBy members tasks reminders').lean();
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const access = ensureCanAccessWorkspace(group, requesterId, role);
    if (!access.allowed) {
      return res.status(403).json({ message: 'Join the group to access its workspace.' });
    }

    const tasks = Array.isArray(group.tasks) ? group.tasks : [];
    const reminders = Array.isArray(group.reminders) ? group.reminders : [];

    return res.json({
      tasks: tasks.map(toClientTask),
      reminders: reminders.map(toClientReminder),
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
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

    const title = String(req.body?.title || '').trim();
    const priority = String(req.body?.priority || 'medium');
    const date = String(req.body?.date || '').trim();

    const allowedPriorities = new Set(['high', 'medium', 'low']);
    if (!title) return res.status(400).json({ message: 'Task title is required.' });
    if (title.length > 120) return res.status(400).json({ message: 'Task title must be 120 characters or less.' });
    if (!allowedPriorities.has(priority)) return res.status(400).json({ message: 'Invalid priority.' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: 'Invalid due date.' });

    const group = await Group.findById(groupId).select('_id createdBy members tasks');
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const access = ensureCanAccessWorkspace(group, requesterId, role);
    if (!access.allowed) {
      return res.status(403).json({ message: 'Join the group to add tasks.' });
    }

    group.tasks.push({ title, priority, date, completed: false, createdBy: requesterId });
    await group.save();

    const created = group.tasks[group.tasks.length - 1];
    return res.status(201).json({
      message: 'Task added.',
      task: toClientTask(created),
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const role = req.user?.role;
    const groupId = req.params?.groupId;
    const taskId = req.params?.taskId;

    if (!requesterId || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task id.' });
    }

    const completed = req.body?.completed;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be a boolean.' });
    }

    const group = await Group.findById(groupId).select('_id createdBy members tasks');
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const access = ensureCanAccessWorkspace(group, requesterId, role);
    if (!access.allowed) {
      return res.status(403).json({ message: 'Join the group to update tasks.' });
    }

    const task = group.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.completed = completed;
    await group.save();

    return res.json({
      message: 'Task updated.',
      task: toClientTask(task),
    });
  } catch (error) {
    next(error);
  }
};

const createReminder = async (req, res, next) => {
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

    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Reminder text is required.' });
    if (text.length > 160) return res.status(400).json({ message: 'Reminder must be 160 characters or less.' });

    const group = await Group.findById(groupId).select('_id createdBy members reminders');
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const access = ensureCanAccessWorkspace(group, requesterId, role);
    if (!access.allowed) {
      return res.status(403).json({ message: 'Join the group to add reminders.' });
    }

    group.reminders.unshift({ text, createdBy: requesterId });
    await group.save();

    const created = group.reminders[0];
    return res.status(201).json({
      message: 'Reminder added.',
      reminder: toClientReminder(created),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspace,
  createTask,
  updateTask,
  createReminder,
};
