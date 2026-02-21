const asyncHandler = require('express-async-handler');
const User = require('./user.model');

// @desc    Get all interns
// @route   GET /api/users/interns
// @access  Private (Mentor/Admin)
const getInterns = asyncHandler(async (req, res) => {
    const interns = await User.find({ role: 'intern' }).select('-password');
    res.json(interns);
});

module.exports = {
    getInterns
};
