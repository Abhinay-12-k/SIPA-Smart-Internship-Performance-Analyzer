const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
