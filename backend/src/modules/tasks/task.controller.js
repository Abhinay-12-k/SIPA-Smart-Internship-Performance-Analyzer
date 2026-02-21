const asyncHandler = require('express-async-handler');
const Task = require('./task.model');
const User = require('../users/user.model');
const { logActivity } = require('../activity/activity.controller');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    let tasks;

    if (req.user.role === 'admin') {
        tasks = await Task.find().populate('assignedTo', 'name email').populate('assignedBy', 'name');
    } else if (req.user.role === 'mentor') {
        tasks = await Task.find({ assignedBy: req.user.id }).populate('assignedTo', 'name email');
    } else {
        tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedBy', 'name');
    }

    res.status(200).json(tasks);
});

// @desc    Set task
// @route   POST /api/tasks
// @access  Private (Mentor/Admin)
const createTask = asyncHandler(async (req, res) => {
    if (req.user.role === 'intern') {
        res.status(401);
        throw new Error('Interns cannot create tasks');
    }

    const { title, description, assignedTo, priority, deadline } = req.body;

    if (!title || !description || !assignedTo || !deadline) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: req.user.id,
        priority,
        deadline
    });

    await logActivity(req.user.id, req.user.role, 'task_created', 'Task', task._id);

    res.status(201).json(task);
});

// @desc    Update task (Submit or Grade)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(400);
        throw new Error('Task not found');
    }

    // Intern submitting task
    if (req.user.role === 'intern') {
        if (task.assignedTo.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        if (req.body.status === 'completed') {
            task.status = 'completed';
            task.submittedAt = Date.now();
            task.submissionLink = req.body.submissionLink || '';

            await logActivity(req.user.id, req.user.role, 'task_completed', 'Task', task._id);
        }
    }

    // Mentor/Admin grading task or updating details
    if (req.user.role === 'mentor' || req.user.role === 'admin') {
        // Mentors can only update tasks they assigned (or admins can update all)
        if (req.user.role === 'mentor' && task.assignedBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized to update this task');
        }

        if (req.body.feedbackScore !== undefined) {
            task.feedbackScore = req.body.feedbackScore;
            task.innovationScore = req.body.innovationScore || 0;
            task.feedbackComment = req.body.feedbackComment || '';

            await logActivity(req.user.id, 'task_graded', `Graded task: ${task.title} with score ${req.body.feedbackScore}`, task._id, 'Task');
        }
    }

    if (req.body.title) task.title = req.body.title;
    if (req.body.description) task.description = req.body.description;
    if (req.body.priority) task.priority = req.body.priority;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Mentor/Admin)
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(400);
        throw new Error('Task not found');
    }

    if (req.user.role === 'intern') {
        res.status(401);
        throw new Error('Interns cannot delete tasks');
    }

    if (req.user.role === 'mentor' && task.assignedBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
