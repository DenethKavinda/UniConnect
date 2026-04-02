const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const GroupFile = require('../models/GroupFile');

const PROTECTED_UPLOAD_ROOT = path.join(__dirname, '..', 'protected_uploads', 'group-files');

const ensureUploadDir = () => {
  if (!fs.existsSync(PROTECTED_UPLOAD_ROOT)) {
    fs.mkdirSync(PROTECTED_UPLOAD_ROOT, { recursive: true });
  }
};

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

const listGroupFiles = async (req, res, next) => {
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

    const files = await GroupFile.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ files });
  } catch (error) {
    next(error);
  }
};

const uploadGroupFiles = async (req, res, next) => {
  try {
    ensureUploadDir();

    const userId = req.user?.id;
    const groupId = req.params?.groupId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    await requireGroupMember({ groupId, userId });

    const incomingFiles = Array.isArray(req.files) ? req.files : [];
    if (incomingFiles.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedByLabel = String(req.user?.name || req.user?.email || 'User');

    const created = [];
    for (const file of incomingFiles) {
      created.push(
        await GroupFile.create({
          groupId,
          uploadedBy: userId,
          uploadedByLabel,
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
        })
      );
    }

    res.status(201).json({ message: 'Files uploaded successfully.', files: created });
  } catch (error) {
    next(error);
  }
};

const downloadGroupFile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params?.groupId;
    const fileId = req.params?.fileId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file id.' });
    }

    await requireGroupMember({ groupId, userId });

    const fileDoc = await GroupFile.findOne({ _id: fileId, groupId }).lean();
    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found.' });
    }

    ensureUploadDir();
    const filePath = path.join(PROTECTED_UPLOAD_ROOT, fileDoc.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File is missing on the server.' });
    }

    if (fileDoc.mimeType) {
      res.setHeader('Content-Type', fileDoc.mimeType);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${fileDoc.originalName}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const deleteGroupFile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params?.groupId;
    const fileId = req.params?.fileId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id.' });
    }

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file id.' });
    }

    await requireGroupMember({ groupId, userId });

    const fileDoc = await GroupFile.findOne({ _id: fileId, groupId }).lean();
    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found.' });
    }

    if (String(fileDoc.uploadedBy) !== String(userId)) {
      return res.status(403).json({ message: 'Only the uploader can delete this file.' });
    }

    ensureUploadDir();
    const filePath = path.join(PROTECTED_UPLOAD_ROOT, fileDoc.storedName);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore file-system errors so we can still delete the DB record
    }

    await GroupFile.deleteOne({ _id: fileId, groupId });

    res.json({ message: 'File deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listGroupFiles,
  uploadGroupFiles,
  downloadGroupFile,
  deleteGroupFile,
  PROTECTED_UPLOAD_ROOT,
  ensureUploadDir,
};
