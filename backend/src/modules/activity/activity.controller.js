const asyncHandler = require('express-async-handler');
const ActivityLog = require('./activityLog.model');

// @desc    Get all activities (Admin only)
// @route   GET /api/activity
// @access  Private/Admin
const getActivities = asyncHandler(async (req, res) => {
    const activities = await ActivityLog.find()
        .populate('user', 'name role')
        .sort({ createdAt: -1 })
        .limit(10); // Return latest 10 logs as requested
    res.status(200).json(activities);
});

// Helper function to log activity (not an exported route)
const logActivity = async (userId, userRole, action, entity, entityId = null) => {
    try {
        await ActivityLog.create({
            user: userId,
            role: userRole,
            action,
            entity,
            entityId
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = {
    getActivities,
    logActivity
};
