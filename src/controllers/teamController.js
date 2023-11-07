import WorkspaceTeam from '../models/workspaceTeamModel.js';
import Workspace from '../models/workspaceModel.js';

export const getWorkspaceTeam = async (req, res) => {
    try {
        const {slug} = req.params;
        const workspace = await Workspace.findOne({slug});
        const workspaceTeam = await WorkspaceTeam.find({workspace: workspace._id})
            .populate('user', 'firstName lastName username email profile_picture');
        res.json({success: true, team: workspaceTeam});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
