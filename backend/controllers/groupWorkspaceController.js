const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const { sendEmail, isMailerConfigured } = require('../utils/mailer');

const normalizeObjectId = (value) => {
  if (!value) return null;
  const candidate = typeof value === 'object' && value._id ? value._id : value;
  const asString = String(candidate);
  if (!mongoose.Types.ObjectId.isValid(asString)) return null;
  return asString;
};

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

    const group = await Group.findById(groupId).select('_id groupName createdBy members tasks');
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const access = ensureCanAccessWorkspace(group, requesterId, role);
    if (!access.allowed) {
      return res.status(403).json({ message: 'Join the group to add tasks.' });
    }

    group.tasks.push({ title, priority, date, completed: false, createdBy: requesterId });
    await group.save();

    const created = group.tasks[group.tasks.length - 1];

    // Best-effort: email all group members when a task is assigned/created.
    try {
      if (isMailerConfigured()) {
        const memberIds = [
          ...(Array.isArray(group.members) ? group.members : []),
          group.createdBy,
        ]
          .map(normalizeObjectId)
          .filter(Boolean);

        const uniqueIds = Array.from(new Set(memberIds));
        if (uniqueIds.length > 0) {
          const users = await User.find({ _id: { $in: uniqueIds } }).select('email');
          const recipients = (Array.isArray(users) ? users : [])
            .map((u) => String(u?.email || '').trim())
            .filter(Boolean);

          const uniqueRecipients = Array.from(new Set(recipients));

          if (uniqueRecipients.length > 0) {
            const groupLabel = group.groupName || 'your group';
            const subject = `UniConnect: New task assigned in ${groupLabel}`;
            const html = `
              <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
                <h2 style="margin: 0 0 8px 0;">New task assigned</h2>
                <p style="margin: 0 0 10px 0;">Group: <strong>${String(groupLabel)}</strong></p>
                <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
                  <p style="margin: 0 0 6px 0;"><strong>${String(title)}</strong></p>
                  <p style="margin: 0; opacity: .8;">Priority: ${String(priority)} • Due: ${String(date)}</p>
                </div>
                <p style="margin: 12px 0 0 0; opacity: .75; font-size: 12px;">Sent by UniConnect</p>
              </div>
            `;
            const text = `New task assigned\n\nGroup: ${String(groupLabel)}\nTask: ${String(title)}\nPriority: ${String(
              priority
            )}\nDue: ${String(date)}\n\nSent by UniConnect`;

            const result = await sendEmail({ to: uniqueRecipients, subject, html, text });
            if (!result.ok) {
              console.warn(`[Workspace] Failed to send task assignment email: ${result.error}`);
            }
          }
        }
      }
    } catch (emailError) {
      console.warn('[Workspace] Task assignment email error:', emailError?.message || emailError);
    }

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
