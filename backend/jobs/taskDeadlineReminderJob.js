const cron = require('node-cron');
const Group = require('../models/Group');
const User = require('../models/User');
const { sendEmail, isMailerConfigured } = require('../utils/mailer');

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKeyToLocalMidnight = (dateKey) => {
  if (typeof dateKey !== 'string') return null;
  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
  if (!match) return null;
  const [y, m, d] = dateKey.split('-').map((n) => Number(n));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const daysBetweenLocalMidnights = (fromDate, toDate) => {
  const ms = toDate.getTime() - fromDate.getTime();
  return Math.round(ms / 86400000);
};

const reminderKeyForToday = (todayKey, daysUntilDue) => `${todayKey}:${daysUntilDue}`;

const hasSentReminderKey = (task, key) => {
  const keys = Array.isArray(task?.lastReminderSentKeys) ? task.lastReminderSentKeys : [];
  return keys.includes(key);
};

const markSentReminderKey = (task, key) => {
  if (!task) return;
  if (!Array.isArray(task.lastReminderSentKeys)) task.lastReminderSentKeys = [];
  if (!task.lastReminderSentKeys.includes(key)) task.lastReminderSentKeys.push(key);
};

const buildTaskListHtml = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return '<p style="margin: 0; opacity: .75;">None</p>';
  const items = tasks
    .map((t) => {
      const title = String(t?.title || 'Untitled task');
      const priority = String(t?.priority || 'medium');
      const due = String(t?.date || '');
      return `<li style="margin: 0 0 8px 0; line-height: 1.4;"><strong>${title}</strong> <span style="opacity:.75">(${priority})</span> <span style="opacity:.6">• ${due}</span></li>`;
    })
    .join('');
  return `<ul style="margin: 6px 0 14px 18px; padding: 0;">${items}</ul>`;
};

const buildEmailHtml = ({ groupName, todayKey, dueIn4Days, dueTomorrow, dueToday }) => {
  const safeGroup = String(groupName || 'Your Group');
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
      <h2 style="margin: 0 0 8px 0;">Assignment deadline reminders</h2>
      <p style="margin: 0 0 14px 0;">Group: <strong>${safeGroup}</strong></p>
      <p style="margin: 0 0 14px 0; opacity: .75;">Date: ${todayKey}</p>

      <h3 style="margin: 16px 0 6px 0;">Due in 4 days</h3>
      ${buildTaskListHtml(dueIn4Days)}

      <h3 style="margin: 16px 0 6px 0;">Due tomorrow</h3>
      ${buildTaskListHtml(dueTomorrow)}

      <h3 style="margin: 16px 0 6px 0;">Due today</h3>
      ${buildTaskListHtml(dueToday)}

      <p style="margin: 0; opacity: .75; font-size: 12px;">Sent by UniConnect</p>
    </div>
  `;
};

const buildEmailText = ({ groupName, todayKey, dueIn4Days, dueTomorrow, dueToday }) => {
  const safeGroup = String(groupName || 'Your Group');
  const toLines = (tasks) =>
    (Array.isArray(tasks) ? tasks : [])
      .map((t) => `- ${String(t?.title || 'Untitled task')} (${String(t?.priority || 'medium')}) • ${String(t?.date || '')}`)
      .join('\n');

  return [
    'Assignment deadline reminders',
    '',
    `Group: ${safeGroup}`,
    `Date: ${todayKey}`,
    '',
    'Due in 4 days:',
    toLines(dueIn4Days) || '(none)',
    '',
    'Due tomorrow:',
    toLines(dueTomorrow) || '(none)',
    '',
    'Due today:',
    toLines(dueToday) || '(none)',
    '',
    'Sent by UniConnect',
  ].join('\n');
};

const sendTodaysTaskReminders = async () => {
  const now = new Date();
  const todayKey = toDateKey(now);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (!isMailerConfigured()) {
    console.warn('[TaskReminderJob] Email is not configured; skipping reminders.');
    return;
  }

  const groups = await Group.find({
    tasks: { $elemMatch: { completed: false } },
  }).select('groupName createdBy members tasks');

  if (!groups || groups.length === 0) return;

  for (const group of groups) {
    const dueIn4Days = [];
    const dueTomorrow = [];
    const dueToday = [];

    for (const task of Array.isArray(group.tasks) ? group.tasks : []) {
      if (!task || task.completed) continue;
      const dueKey = String(task.date || '');
      const dueMidnight = parseDateKeyToLocalMidnight(dueKey);
      if (!dueMidnight) continue;

      const daysUntilDue = daysBetweenLocalMidnights(todayMidnight, dueMidnight);
      if (![0, 1, 4].includes(daysUntilDue)) continue;

      const sendKey = reminderKeyForToday(todayKey, daysUntilDue);
      if (hasSentReminderKey(task, sendKey)) continue;

      if (daysUntilDue === 4) dueIn4Days.push(task);
      if (daysUntilDue === 1) dueTomorrow.push(task);
      if (daysUntilDue === 0) dueToday.push(task);
    }

    if (dueIn4Days.length === 0 && dueTomorrow.length === 0 && dueToday.length === 0) continue;

    const memberIds = [
      ...(Array.isArray(group.members) ? group.members : []),
      group.createdBy,
    ]
      .filter(Boolean)
      .map((id) => String(id));

    const uniqueIds = Array.from(new Set(memberIds));
    if (uniqueIds.length === 0) continue;

    const users = await User.find({ _id: { $in: uniqueIds } }).select('email name');
    const recipients = (Array.isArray(users) ? users : [])
      .map((u) => String(u?.email || '').trim())
      .filter(Boolean);

    if (recipients.length === 0) continue;

    const subject = `UniConnect: ${group.groupName || 'Group'} assignment deadlines`;
    const html = buildEmailHtml({ groupName: group.groupName, todayKey, dueIn4Days, dueTomorrow, dueToday });
    const text = buildEmailText({ groupName: group.groupName, todayKey, dueIn4Days, dueTomorrow, dueToday });

    const result = await sendEmail({ to: recipients, subject, html, text });

    if (result.ok) {
      // Mark tasks as reminded for each offset for today
      for (const task of dueIn4Days) {
        markSentReminderKey(task, reminderKeyForToday(todayKey, 4));
        task.lastReminderSentAt = new Date();
      }
      for (const task of dueTomorrow) {
        markSentReminderKey(task, reminderKeyForToday(todayKey, 1));
        task.lastReminderSentAt = new Date();
      }
      for (const task of dueToday) {
        markSentReminderKey(task, reminderKeyForToday(todayKey, 0));
        task.lastReminderSentAt = new Date();
      }
      await group.save();
      console.log(
        `[TaskReminderJob] Sent ${recipients.length} reminder(s) for group ${group._id} (due4=${dueIn4Days.length}, due1=${dueTomorrow.length}, due0=${dueToday.length})`
      );
    } else {
      console.warn(`[TaskReminderJob] Failed to send reminders for group ${group._id}: ${result.error}`);
    }
  }
};

let started = false;
let scheduled = null;

const startTaskDeadlineReminderJob = () => {
  if (started) return;
  started = true;

  const cronExpr = process.env.TASK_REMINDER_CRON || '0 8 * * *';

  if (!cron.validate(cronExpr)) {
    console.warn(`[TaskReminderJob] Invalid TASK_REMINDER_CRON="${cronExpr}"; using default 0 8 * * *`);
  }

  const scheduleExpr = cron.validate(cronExpr) ? cronExpr : '0 8 * * *';

  scheduled = cron.schedule(scheduleExpr, () => {
    sendTodaysTaskReminders().catch((err) => {
      console.error('[TaskReminderJob] Unhandled error:', err);
    });
  });

  // Also run once shortly after startup (so you can test without waiting a day).
  setTimeout(() => {
    sendTodaysTaskReminders().catch((err) => {
      console.error('[TaskReminderJob] Startup run error:', err);
    });
  }, 5000);

  console.log(`[TaskReminderJob] Scheduled task deadline reminders: "${scheduleExpr}"`);
};

module.exports = {
  startTaskDeadlineReminderJob,
  sendTodaysTaskReminders,
};
