const express = require('express');
const router = express.Router();
const { getActivities } = require('./activity.controller');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

router.get('/', protect, adminOnly, getActivities);

module.exports = router;
