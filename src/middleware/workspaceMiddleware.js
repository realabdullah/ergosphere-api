import Workspace from '../models/workspaceModel.js';

const checkMemberMiddleware = async (req, res, next) => {
    const workspace = await Workspace.findOne({slug: req.params.slug});
    if (!workspace || !workspace.team.includes(req.user._id)) {
        return res.status(403).json({error: 'We could not find the workspace you are looking for!'});
    }
    next();
};

export default checkMemberMiddleware;
