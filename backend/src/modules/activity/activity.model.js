const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    action: {
        type: String,
        required: true // 'registered', 'task_created', 'task_submitted', 'task_graded'
    },
    details: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        enum: ['Task', 'User']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
