import express from 'express';
import {
    addNewWorkspace, getWorkspace, getWorkspaces, deleteWorkspace, updateWorkspace,
} from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', authMiddleware, getWorkspaces);
router.get('/:slug', authMiddleware, getWorkspace);
router.post('/', authMiddleware, addNewWorkspace);
router.put('/:slug', authMiddleware, updateWorkspace);
router.delete('/:slug', authMiddleware, deleteWorkspace);

export default router;
