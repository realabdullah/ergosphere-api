/* eslint-disable require-jsdoc */

import Workspace from '../models/workspaceModel.js';

export const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({user: req.user._id}).populate('user', 'firstName lastName');
        res.send({success: true, workspaces});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const getWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            user: req.user._id,
            slug: req.params.slug,
        }).populate('user', 'firstName lastName');
        if (!workspace) {
            return res.status(404).json({error: 'Workspace not found', success: false});
        }
        res.json({success: true, workspace});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const payload = req.body;
        const workspace = await Workspace.findOneAndUpdate({
            user: req.user._id,
            slug: req.params.slug,
        }, payload, {new: true}).populate('user', 'firstName lastName');
        if (!workspace) {
            return res.status(404).json({error: 'Workspace not found', success: false});
        }
        res.json({success: true, workspace});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findOneAndDelete({
            user: req.user._id,
            slug: req.params.slug,
        });
        if (!workspace) {
            return res.status(404).json({error: 'Workspace not found', success: false});
        }
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

export const addNewWorkspace = async (req, res) => {
    try {
        const workspace = await createWorkspace({...req.body, user: req.user._id});
        res.status(201).json({success: true, workspace});
    } catch (error) {
        res.status(500).json({error: error.message, success: false});
    }
};

const checkIfSlugExists = async (slug) => {
    const count = await Workspace.countDocuments({slug});
    return count > 0;
};

export const createWorkspace = async (payload, usage = 'create') => {
    const {slug} = payload;
    const slugExists = await checkIfSlugExists(slug);
    if (slugExists && usage === 'create') {
        throw new Error('A workspace with this slug already exists');
    } else if (slugExists && usage === 'new-user') {
        let newSlug = Math.random().toString(36).substring(2, 10);
        while (await checkIfSlugExists(newSlug)) {
            newSlug = Math.random().toString(36).substring(2, 10);
        }
        payload.slug = newSlug;
    }

    const workspace = new Workspace(payload);
    const savedWorkspace = await workspace.save();
    return savedWorkspace;
};
