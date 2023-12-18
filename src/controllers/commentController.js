/* eslint-disable require-jsdoc */
import Comment from '../models/commentModel.js';

export const getTaskComments = async (req, res) => {
    try {
        const {id} = req.params;
        const comments = await Comment.find({
            task: id,
        }).populate('user', 'username firstName lastName profile_picture');

        if (!comments) throw new Error();

        res.json({success: true, comments});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

export const addTaskComment = async (req, res) => {
    try {
        const comment = new Comment({...req.body, user: req.user._id});
        await comment.save();
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'username firstName lastName profile_picture');
        res.json({success: true, comment: populatedComment});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
