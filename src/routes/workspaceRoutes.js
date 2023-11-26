import express from 'express';
import {
    addNewWorkspace, getWorkspace, getWorkspaces, deleteWorkspace, updateWorkspace,
} from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import checkMemberMiddleware from '../middleware/workspaceMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', authMiddleware, getWorkspaces);
router.get('/:slug', authMiddleware, checkMemberMiddleware, getWorkspace);
router.post('/', authMiddleware, addNewWorkspace);
router.put('/:slug', authMiddleware, checkMemberMiddleware, updateWorkspace);
router.delete('/:slug', authMiddleware, checkMemberMiddleware, deleteWorkspace);

export default router;
