const express = require('express');
const router = express.Router();
const { getPerformance, getTopPerformers } = require('./performance.controller');
const { protect } = require('../../middleware/authMiddleware');

router.get('/top', protect, getTopPerformers);
router.get('/:internId', protect, getPerformance);

module.exports = router;
