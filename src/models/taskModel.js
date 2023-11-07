/* eslint-disable no-invalid-this */
import {Schema, model} from 'mongoose';

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started',
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: Date,
});

taskSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        ret.assignees = ret.assignees.map((assignee) => (assignee.username));
        ret.workspace = ret.workspace.slug;
        ret.user = {
            username: ret.user.username,
            name: `${ret.user.firstName} ${ret.user.lastName}`,
        };
        return ret;
    },
});

taskSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.createdAt = new Date();
    }

    next();
});

const Task = model('Task', taskSchema);

export default Task;
