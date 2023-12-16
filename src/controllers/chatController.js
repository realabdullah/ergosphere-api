/* eslint-disable require-jsdoc */
import Chat from '../models/chatModel.js';

export const getTaskChats = async (req, res) => {
    try {
        const {id} = req.params;
        const chats = await Chat.find({
            task: id,
        }).populate('user', 'username firstName lastName profile_picture');

        if (!chats) throw new Error();

        res.json({success: true, chats});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

export const addTaskChat = async (req, res) => {
    try {
        const chat = new Chat({...req.body, user: req.user._id});
        await chat.save();
        const populatedChat = await Chat.findById(chat._id)
            .populate('user', 'username firstName lastName profile_picture');
        res.json({success: true, chat: populatedChat});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
