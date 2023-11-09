import jwt from 'jsonwebtoken';
import Workspace from '../models/workspaceModel.js';
import User from '../models/userModel.js';
import Invite from '../models/inviteModel.js';
import {workspaceInviteTemplate} from '../services/email/templates/invite.js';
import {sendEmail} from '../services/email/email.js';

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

        const template = workspaceInviteTemplate(workspace.title, url, req.user.firstName);
        await sendEmail({
            to: email,
            subject: 'You have been invited to a workspace',
            html: template,
        });

        const invite = new Invite({token});
        await invite.save();

        res.status(201).json({message: 'User invited successfully'});
    } catch (error) {
        console.error(error);
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

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({message: 'Workspace not found'});
        }

        const user = await User.findOne({email});

        if (user) {
            await workspace.addUser(user._id);
            invite.used = true;
            await invite.save();
        }

        res.status(200).json({success: true, isNew});
    } catch (error) {
        console.error(error);
        res.status(401).json({message: 'Invalid token', success: false});
    }
};

export {inviteUser, acceptInvite};
