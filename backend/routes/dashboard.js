const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const GroupFile = require("../models/GroupFile");
const GroupMessage = require("../models/GroupMessage");
const User = require("../models/User");
const Material = require("../models/Material");

const router = express.Router();

const toLocalDateKey = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clampText = (value, max = 60) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const computeCredits = ({ posts = 0, comments = 0, files = 0, messages = 0 }) => {
  return posts * 10 + comments * 3 + files * 8 + messages * 1;
};

router.get("/summary", protect, async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const todayKey = toLocalDateKey(new Date());

    const groups = await Group.find({
      $or: [{ members: userId }, { createdBy: userId }],
    })
      .select("_id groupName tasks")
      .lean();

    const groupNameById = new Map(
      (groups || []).map((g) => [String(g._id), String(g.groupName || "Group")])
    );

    let tasksTotal = 0;
    let tasksCompleted = 0;
    let pendingTasksToday = 0;
    let pendingTasksTotal = 0;

    for (const group of groups || []) {
      const tasks = Array.isArray(group.tasks) ? group.tasks : [];
      for (const task of tasks) {
        tasksTotal += 1;
        if (task?.completed) tasksCompleted += 1;
        if (!task?.completed) pendingTasksTotal += 1;
        if (String(task?.date) === todayKey && !task?.completed) {
          pendingTasksToday += 1;
        }
      }
    }

    const progressPercent =
      tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    // Credits + rank (based on existing user-linked collections)
    const [myPosts, myComments, myFiles, myMessages] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Comment.countDocuments({ author: userId }),
      GroupFile.countDocuments({ uploadedBy: userId }),
      GroupMessage.countDocuments({ senderId: userId }),
    ]);

    const myCredits = computeCredits({
      posts: myPosts,
      comments: myComments,
      files: myFiles,
      messages: myMessages,
    });

    // Approximate "hours" from activity volume (real time-tracking isn't stored).
    const hours = Math.max(0, Math.round((myPosts + myComments + myMessages) / 2));

    const studentIds = await User.find({ role: "student", isBlocked: false })
      .select("_id")
      .lean();

    const idSet = new Set((studentIds || []).map((u) => String(u._id)));

    const [postAgg, commentAgg, fileAgg, messageAgg] = await Promise.all([
      Post.aggregate([{ $group: { _id: "$author", c: { $sum: 1 } } }]),
      Comment.aggregate([{ $group: { _id: "$author", c: { $sum: 1 } } }]),
      GroupFile.aggregate([{ $group: { _id: "$uploadedBy", c: { $sum: 1 } } }]),
      GroupMessage.aggregate([{ $group: { _id: "$senderId", c: { $sum: 1 } } }]),
    ]);

    const creditByUser = new Map();

    const bump = (userKey, field, count) => {
      if (!userKey) return;
      const key = String(userKey);
      if (!idSet.has(key)) return;
      const current = creditByUser.get(key) || { posts: 0, comments: 0, files: 0, messages: 0 };
      current[field] += Number(count) || 0;
      creditByUser.set(key, current);
    };

    for (const row of postAgg || []) bump(row._id, "posts", row.c);
    for (const row of commentAgg || []) bump(row._id, "comments", row.c);
    for (const row of fileAgg || []) bump(row._id, "files", row.c);
    for (const row of messageAgg || []) bump(row._id, "messages", row.c);

    const scored = [];
    for (const key of idSet) {
      const counts = creditByUser.get(key) || { posts: 0, comments: 0, files: 0, messages: 0 };
      scored.push({
        userId: key,
        credits: computeCredits(counts),
      });
    }

    scored.sort((a, b) => b.credits - a.credits);
    const myRankIndex = scored.findIndex((s) => s.userId === String(userId));
    const rank = myRankIndex >= 0 ? myRankIndex + 1 : scored.length + 1;

    // Recent activity feed
    const groupIds = (groups || []).map((g) => g._id);

    const [recentFiles, recentMessages, recentPosts, recentComments, recentUsers, recentMaterials] = await Promise.all([
      groupIds.length
        ? GroupFile.find({ groupId: { $in: groupIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("uploadedBy", "name email")
            .lean()
        : [],
      groupIds.length
        ? GroupMessage.find({ groupId: { $in: groupIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("senderId", "name email")
            .lean()
        : [],
      Post.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("author", "name email")
        .lean(),
      Comment.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("author", "name email")
        .populate("post", "title")
        .lean(),
      User.find({ role: "student", isBlocked: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name email createdAt")
        .lean(),
      Material.find({})
        .sort({ uploadedAt: -1 })
        .limit(10)
        .populate("uploadedBy", "name email")
        .lean(),
    ]);

    const activity = [];

    for (const f of recentFiles || []) {
      const actor = f?.uploadedBy?.name || f?.uploadedBy?.email || "User";
      const groupName = groupNameById.get(String(f.groupId)) || "Group";
      activity.push({
        id: `file:${f._id}`,
        name: actor,
        action: "uploaded",
        target: clampText(`${groupName} · ${f.originalName}`),
        time: f.createdAt,
        color: "blue",
      });
    }

    for (const m of recentMessages || []) {
      const actor = m?.senderId?.name || m?.senderId?.email || "User";
      const groupName = groupNameById.get(String(m.groupId)) || "Group";
      activity.push({
        id: `msg:${m._id}`,
        name: actor,
        action: "messaged",
        target: clampText(`${groupName} chat`),
        time: m.createdAt,
        color: "blue",
      });
    }

    for (const p of recentPosts || []) {
      const actor = p?.author?.name || p?.author?.email || "User";
      activity.push({
        id: `post:${p._id}`,
        name: actor,
        action: "posted",
        target: clampText(p.title || "Forum"),
        time: p.createdAt,
        color: "blue",
      });
    }

    for (const c of recentComments || []) {
      const actor = c?.author?.name || c?.author?.email || "User";
      activity.push({
        id: `comment:${c._id}`,
        name: actor,
        action: "commented",
        target: clampText(c?.post?.title || "Forum"),
        time: c.createdAt,
        color: "amber",
      });
    }

    for (const u of recentUsers || []) {
      const actor = u?.name || "New user";
      activity.push({
        id: `user:${u._id}`,
        name: clampText(actor, 28),
        action: "registered",
        target: "UniConnect",
        time: u.createdAt,
        color: "amber",
      });
    }

    for (const mat of recentMaterials || []) {
      const actor =
        mat?.uploadedByLabel || mat?.uploadedBy?.name || mat?.uploadedBy?.email || "User";
      activity.push({
        id: `material:${mat._id}`,
        name: clampText(actor, 28),
        action: "uploaded",
        target: clampText(mat?.module || "Material"),
        time: mat.uploadedAt || mat.createdAt,
        color: "blue",
      });
    }

    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({
      stats: {
        pendingTasksToday,
        pendingTasksTotal,
        progressPercent,
        hours,
        credits: myCredits,
        rank,
      },
      activity: activity.slice(0, 6),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
