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

const WorkspaceTeam = model('WorkspaceMember', workspaceMemberSchema);

export default WorkspaceTeam;
