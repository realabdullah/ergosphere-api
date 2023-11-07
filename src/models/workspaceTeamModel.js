import {Schema, model} from 'mongoose';

const workspaceMemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
});

workspaceMemberSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.__v;
        delete ret._id;
        delete ret.workspace;
        ret.name = `${ret.user.firstName} ${ret.user.lastName}`;
        ret.username = ret.user.username;
        ret.profile_picture = ret.user.profile_picture;
        ret.email = ret.user.email;
        delete ret.user;
        return ret;
    },
});

const WorkspaceTeam = model('WorkspaceMember', workspaceMemberSchema);

export default WorkspaceTeam;
