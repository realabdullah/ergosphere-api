import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import {createWorkspace} from './workspaceController.js';
import {sendWelcomeNotification} from '../services/knock.js';

export const register = async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const {name, email, password} = req.body;
        const [firstName, lastName] = name.split(' ');

        const user = new User({firstName, lastName, email, password});
        const savedUser = await user.save();
        const access = await user.generateAccessToken();
        const refresh = await user.generateRefreshToken();
        // Create a workspace for the user
        const workspacePayload = {
            title: `${firstName}'s Workspace`,
            description: `This is ${firstName}'s workspace`,
            slug: `${firstName.toLowerCase()}workspace`,
            user: savedUser._id,
        };
        const workspace = await createWorkspace(workspacePayload, 'new-user');
        savedUser.workspace = workspace._id;

        // Send welcome email
        await sendWelcomeNotification(savedUser);
        res.status(201).json({success: true, user: savedUser, accessToken: {
            token: access,
            expires: new Date(Date.now() + 60 * 60 * 1000),
        }, refreshToken: {
            token: refresh,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }});
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => {
                return err.message;
            });
            return res.status(400).json({error: errors});
        }
        res.status(500).json({error: error.message, success: false});
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findByCredentials(email, password);
        const access = await user.generateAccessToken();
        const refresh = await user.generateRefreshToken();

        res.json({success: true, user, accessToken: {
            token: access,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }, refreshToken: {
            token: refresh,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const logout = async (req, res) => {
    try {
        const user = req.user;
        user.token = '';
        await user.save();
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};


export const refresh = async (req, res) => {
    try {
        const {token} = req.body;
        const header = req.header('Authorization');

        if (!token || !header) {
            return res.status(401).json({error: '1You are not authorized'});
        }

        const accessToken = header.split(' ')[1];

        const expiredAccessToken = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            {ignoreExpiration: true},
        );
        const expiredTokenHash = crypto
            .createHash('sha256')
            .update(accessToken)
            .digest('hex');

        const decodedRefreshToken = jwt.verify(
            token, process.env.REFRESH_TOKEN_SECRET,
        );

        if (expiredAccessToken.id !== decodedRefreshToken.id) {
            return res.status(401).json({error: '2You are not authorized'});
        }

        const user = await User.findOne({_id: decodedRefreshToken.id});

        if (!user) {
            return res.status(401).json({error: '3You are not authorized'});
        }

        if (user.token !== expiredTokenHash) {
            return res.status(401).json({error: '4You are not authorized'});
        }

        const access = await user.generateAccessToken();
        const refresh = await user.generateRefreshToken();

        res.json({success: true, accessToken: {
            token: access,
            expires: new Date(Date.now() + 60 * 60 * 1000),
        }, refreshToken: {
            token: refresh,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user._id});
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({success: true, user});
    } catch (error) {
        res.status(500).json({error: 'User not found'});
    }
};

export const editUser = async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username});
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        const {name, password} = req.body;
        if (password) user.password = password;
        const [firstName, lastName] = name.split(' ');
        user.firstName = firstName;
        user.lastName = lastName;
        await user.save();
        res.json({success: true, user});
    } catch (error) {
        res.status(500).json({error: 'User not found', success: false});
    }
};

export const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        user.profile_picture = req.body.profile_picture;
        await user.save();
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: 'User not found', success: false});
    }
};
