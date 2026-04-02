const express = require('express');
const { getGroups, createGroup, joinGroup } = require('../controllers/groupController');
const { isLoggedIn } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
	listGroupFiles,
	uploadGroupFiles,
	downloadGroupFile,
	deleteGroupFile,
	ensureUploadDir,
	PROTECTED_UPLOAD_ROOT,
} = require('../controllers/groupFileController');

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		try {
			ensureUploadDir();
			cb(null, PROTECTED_UPLOAD_ROOT);
		} catch (err) {
			cb(err);
		}
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname || '').toLowerCase();
		cb(null, `${uniqueSuffix}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024,
		files: 5,
	},
});

router.get('/', isLoggedIn, getGroups);
router.post('/', isLoggedIn, createGroup);
router.post('/:groupId/join', isLoggedIn, joinGroup);

router.get('/:groupId/files', isLoggedIn, listGroupFiles);
router.post('/:groupId/files', isLoggedIn, upload.array('files', 5), uploadGroupFiles);
router.get('/:groupId/files/:fileId/download', isLoggedIn, downloadGroupFile);
router.delete('/:groupId/files/:fileId', isLoggedIn, deleteGroupFile);

module.exports = router;
