const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    submissionLink: {
        type: String
    },
    submittedAt: {
        type: Date
    },
    feedbackScore: {
        type: Number,
        min: 0,
        max: 10
    },
    feedbackComment: {
        type: String
    },
    innovationScore: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
