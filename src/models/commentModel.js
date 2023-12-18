/* eslint-disable no-invalid-this */
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    message: {
        type: String,
        require: true,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: Date,
});

CommentSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.createdAt = new Date();
    }

    next();
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
