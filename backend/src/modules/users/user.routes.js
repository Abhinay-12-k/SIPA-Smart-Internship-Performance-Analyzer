const express = require('express');
const router = express.Router();
const { getInterns } = require('./user.controller');
const { protect, mentorOnly } = require('../../middleware/authMiddleware');

router.get('/interns', protect, mentorOnly, getInterns);

module.exports = router;
