const express = require('express');
const { getGroups, createGroup, joinGroup } = require('../controllers/groupController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/', isLoggedIn, getGroups);
router.post('/', isLoggedIn, createGroup);
router.post('/:groupId/join', isLoggedIn, joinGroup);

module.exports = router;
