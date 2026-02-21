const asyncHandler = require('express-async-handler');
const Task = require('../tasks/task.model');
const User = require('../users/user.model');

// @desc    Get performance metrics
// @route   GET /api/performance/:internId
// @access  Private (Admin/Mentor/Intern)
const getPerformance = asyncHandler(async (req, res) => {
    const internId = req.params.internId;

    // Check permissions
    if (req.user.role === 'intern' && req.user.id !== internId) {
        res.status(401);
        throw new Error('Not authorized to view this performance');
    }

    const allTasks = await Task.find({ assignedTo: internId });
    const completedTasks = allTasks.filter(task => task.status === 'completed');

    const totalTasksCount = allTasks.length;
    const completedTasksCount = completedTasks.length;

    // 1. Completion Rate
    const completionRate = totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;

    // 2. Average Feedback Score
    let totalScore = 0;
    let scoredTasksCount = 0;
    completedTasks.forEach(task => {
        if (task.feedbackScore !== undefined && task.feedbackScore !== null) {
            totalScore += task.feedbackScore;
            scoredTasksCount++;
        }
    });
    const averageFeedbackScore = scoredTasksCount === 0 ? 0 : (totalScore / scoredTasksCount);

    // 3. Deadline Discipline
    let onTimeTasksCount = 0;
    completedTasks.forEach(task => {
        if (task.submittedAt && task.deadline && new Date(task.submittedAt) <= new Date(task.deadline)) {
            onTimeTasksCount++;
        }
    });
    const deadlineDiscipline = completedTasksCount === 0 ? 0 : (onTimeTasksCount / completedTasksCount) * 100;

    // 4. Overall Score (Weighted)
    // Weights: Completion (30%), Feedback (40%), Discipline (30%)
    // Normalize feedback to 0-100
    const normalizedFeedback = averageFeedbackScore * 10;
    const overallScore = (completionRate * 0.3) + (normalizedFeedback * 0.4) + (deadlineDiscipline * 0.3);

    res.status(200).json({
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        completionRate: Math.round(completionRate * 10) / 10,
        averageFeedbackScore: Math.round(averageFeedbackScore * 10) / 10,
        deadlineDiscipline: Math.round(deadlineDiscipline * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10
    });
});

// @desc    Get top performers
// @route   GET /api/performance/top
// @access  Private
const getTopPerformers = asyncHandler(async (req, res) => {
    const { role, id } = req.user;

    // Get all completed tasks
    let query = { status: 'completed' };

    // If mentor, only get tasks assigned by them
    if (role === 'mentor') {
        query.assignedBy = id;
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name');

    // Group by intern
    const internStats = {};

    tasks.forEach(task => {
        const internId = task.assignedTo._id.toString();
        const internName = task.assignedTo.name;

        if (!internStats[internId]) {
            internStats[internId] = {
                name: internName,
                totalTasks: 0,
                completedTasks: 0,
                totalFeedback: 0,
                feedbackCount: 0,
                onTimeTasks: 0,
                totalInnovation: 0,
                innovationCount: 0
            };
        }

        const stats = internStats[internId];
        stats.completedTasks++;

        if (task.feedbackScore !== undefined && task.feedbackScore !== null) {
            stats.totalFeedback += task.feedbackScore;
            stats.feedbackCount++;
        }

        if (task.submittedAt && task.deadline && new Date(task.submittedAt) <= new Date(task.deadline)) {
            stats.onTimeTasks++;
        }

        if (task.innovationScore !== undefined && task.innovationScore !== null) {
            stats.totalInnovation += task.innovationScore;
            stats.innovationCount++;
        }
    });

    // We also need total tasks (including pending) to calculate completion rate accurately
    // But for "Top Performers", usually we base it on what they have DONE.
    // However, the formula asks for taskCompletion. Let's get total tasks per intern.
    const allTasks = await Task.find(role === 'mentor' ? { assignedBy: id } : {});
    allTasks.forEach(task => {
        const internId = task.assignedTo.toString();
        if (internStats[internId]) {
            internStats[internId].totalTasks++;
        }
    });

    // Calculate scores
    const performers = Object.keys(internStats).map(internId => {
        const stats = internStats[internId];

        const taskCompletion = stats.totalTasks === 0 ? 0 : (stats.completedTasks / stats.totalTasks) * 100;
        const avgFeedback = stats.feedbackCount === 0 ? 0 : (stats.totalFeedback / stats.feedbackCount) * 10; // Normalize to 100
        const deadlineDiscipline = stats.completedTasks === 0 ? 0 : (stats.onTimeTasks / stats.completedTasks) * 100;
        const innovation = stats.innovationCount === 0 ? 0 : (stats.totalInnovation / stats.innovationCount) * 10; // Normalize to 100

        // Formula: (taskCompletion * 0.4) + (avgFeedback * 0.3) + (deadlineDiscipline * 0.2) + (innovation * 0.1)
        const score = (taskCompletion * 0.4) + (avgFeedback * 0.3) + (deadlineDiscipline * 0.2) + (innovation * 0.1);

        return {
            id: internId,
            name: stats.name,
            score: Math.round(score * 10) / 10
        };
    });

    // Sort and rank
    const topPerformers = performers
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((p, index) => ({
            ...p,
            rank: index + 1
        }));

    res.status(200).json(topPerformers);
});

module.exports = {
    getPerformance,
    getTopPerformers
};
