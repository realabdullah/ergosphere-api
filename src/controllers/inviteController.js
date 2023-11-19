import jwt from 'jsonwebtoken';
import Workspace from '../models/workspaceModel.js';
import User from '../models/userModel.js';
import Invite from '../models/inviteModel.js';
import {acceptInviteNotification} from '../services/pusher.js';
import {sendInviteNotification as sendKnockInviteNotification} from '../services/knock.js';

const inviteUser = async (req, res) => {
    const {email, slug} = req.body;

    try {
        const workspace = await Workspace.findOne({slug});
        if (!workspace) {
            return res.status(404).json({message: 'Workspace not found'});
        }

        const user = await User.findOne({email});
        let isNewUser = false;
        if (!user) {
            isNewUser = true;
        } else if (workspace.team.includes(user._id)) {
            return res.status(400).json({message: 'User already in workspace'});
        }

        const token = jwt.sign({email, workspaceId: workspace._id, isNew: isNewUser}, process.env.JWT_SECRET);
        const url = `${process.env.CLIENT_URL}/accept/${token}`;

        const invite = new Invite({token});
        await invite.save();

        sendKnockInviteNotification(email, workspace.title, req.user, url);

        res.status(201).json({message: 'User invited successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
};

const acceptInvite = async (req, res) => {
    const {token} = req.body;

    try {
        const invite = await Invite.findOne({token});
        if (!invite) {
            return res.status(404).json({message: 'Invite not found'});
        }

        if (invite.used) {
            return res.status(400).json({message: 'Invite already used'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {email, workspaceId, isNew} = decoded;

        const workspace = await Workspace.findOne({_id: workspaceId})
            .populate('user', 'firstName lastName')
            .populate('team', 'firstName lastName username profile_picture email');

        if (!workspace) {
            return res.status(404).json({message: 'Workspace not found'});
        }

        const user = await User.findOne({email});

        if (user) {
            await workspace.addUser(user._id);
            invite.used = true;
            await invite.save();

            acceptInviteNotification(
                workspace.user._id, workspace, user,
            );
        }

        res.status(200).json({success: true, isNew});
    } catch (error) {
        console.log('error => ', error);
        res.status(401).json({message: 'Invalid token', success: false});
    }
};

export {inviteUser, acceptInvite};
