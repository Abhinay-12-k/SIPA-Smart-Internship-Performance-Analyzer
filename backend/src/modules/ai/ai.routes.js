const express = require('express');
const router = express.Router();
const { generateFeedback } = require('./ai.service');
const { protect } = require('../../middleware/authMiddleware');

router.post('/:internId', protect, generateFeedback);

module.exports = router;
