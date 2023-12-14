/* eslint-disable require-jsdoc */
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import Workspace from '../models/workspaceModel.js';

const getAssignee = async (assignee) => {
    const userQuery = {username: assignee};
    const user = await User.findOne(userQuery);
    return user ? user._id : null;
};

export const addTask = async (req, res) => {
    try {
        const {slug} = req.params;
        const assignee = await getAssignee(req.body.assignee);
        const workspace = await Workspace.findOne({slug});

        const newTask = new Task({
            ...req.body,
            user: req.user._id,
            workspace: workspace._id,
            assignee,
        });
        const savedTask = await newTask.save();

        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignee', 'username')
            .populate('user', 'firstName lastName username')
            .populate('workspace', 'slug');
        res.status(201).json({success: true, task: populatedTask});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};


export const updateTask = async (req, res) => {
    try {
        const {slug, id} = req.params;
        req.body.assignee = await getAssignee(req.body.assignee);
        const workspace = await Workspace.findOne({slug});
        const task = await Task.findOneAndUpdate({
            user: req.user._id,
            _id: id,
            workspace: workspace._id,
        }, req.body, {new: true})
            .populate('assignee', 'username')
            .populate('user', 'firstName lastName username')
            .populate('workspace', 'slug');
        if (!task) throw new Error('Task not found');
        res.json({success: true, task});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const fetchWorkspaceTask = async (req, res) => {
    try {
        const {id, slug} = req.params;
        const workspace = await Workspace.findOne({slug});
        const task = await Task.findOne({
            user: req.user._id,
            _id: id,
            workspace: workspace._id,
        }).populate('assignee', 'username')
            .populate('user', 'firstName lastName username')
            .populate('workspace', 'slug');
        if (!task) throw new Error('Task not found');
        res.json({success: true, task});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const deleteTask = async (req, res) => {
    try {
        const {slug, id} = req.params;
        const user = req.user;
        const workspace = await Workspace.findOne({slug});
        if (workspace.user.toString() !== user._id.toString()) {
            throw new Error('You are not authorized to perform this action');
        }
        const task = await Task.findOneAndDelete({
            user: user._id,
            _id: id,
            workspace: workspace._id,
        });
        if (!task) throw new Error('Task not found');
        res.json({success: true});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

export const fetchWorkspaceTasks = async (req, res) => {
    try {
        const {slug} = req.params;
        const workspace = await Workspace.findOne({slug});
        const tasks = await Task.find({
            workspace: workspace._id,
        }).populate('assignee', 'username')
            .populate('user', 'firstName lastName username')
            .populate('workspace', 'slug');
        res.json({success: true, tasks});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
