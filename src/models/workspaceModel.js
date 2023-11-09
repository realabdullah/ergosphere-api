/* eslint-disable no-invalid-this */
import {Schema, model} from 'mongoose';
import WorkspaceTeam from './workspaceTeamModel.js';

const workspaceSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    avatar: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
});

workspaceSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.__v;
        ret.owner = `${ret?.user?.firstName} ${ret?.user?.lastName}`;
        ret.team = ret?.team?.map((member) => ({
            name: `${member.firstName} ${member.lastName}`,
            username: member.username,
            profile_picture: member.profile_picture,
            email: member.email,
        }));
        delete ret.user;
        delete ret._id;
        return ret;
    },
});

workspaceSchema.pre('save', async function(next) {
    if (this.isNew) {
        const initials = this.title
            .split(' ')
            .map((n) => n[0])
            .join('');

        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
        this.avatar = avatarUrl;
        this.team.push(this.user._id);

        next();
    }
});


workspaceSchema.post('save', async function(doc) {
    if (this.isNew) {
        const workspaceTeam = new WorkspaceTeam({user: doc.user, workspace: doc._id});
        await workspaceTeam.save();
    }
});

workspaceSchema.methods.addUser = async function(userId) {
    this.team.push(userId);
    await this.save();

    const workspaceTeam = new WorkspaceTeam({user: userId, workspace: this._id});
    await workspaceTeam.save();
};

const Workspace = model('Workspace', workspaceSchema);

export default Workspace;
