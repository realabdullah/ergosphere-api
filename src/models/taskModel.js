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
        enum: ['low', 'medium', 'high'],
        default: 'medium',
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
});

taskSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        ret.assignees = ret.assignees.map((assignee) => ({
            username: assignee.username,
        }));
        ret.workspace = ret.workspace.slug;
        ret.user = {
            username: ret.user.username,
            name: `${ret.user.firstName} ${ret.user.lastName}`,
        };
        return ret;
    },
});

const Task = model('Task', taskSchema);

export default Task;
