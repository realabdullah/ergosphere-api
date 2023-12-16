/* eslint-disable no-invalid-this */
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
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

ChatSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.createdAt = new Date();
    }

    next();
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;
