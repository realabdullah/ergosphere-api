import express from 'express';
import {
    addTask, updateTask, deleteTask, fetchWorkspaceTask, fetchWorkspaceTasks,
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/:slug/create', authMiddleware, addTask);
router.put('/:slug/:id', authMiddleware, updateTask);
router.delete('/:slug/:id', authMiddleware, deleteTask);
router.get('/:slug/:id', authMiddleware, fetchWorkspaceTask);
router.get('/:slug', authMiddleware, fetchWorkspaceTasks);

export default router;
