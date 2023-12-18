import express from 'express';
import {
    addTask, updateTask, deleteTask, fetchWorkspaceTask, fetchWorkspaceTasks,
} from '../controllers/taskController.js';
import {getTaskComments, addTaskComment} from '../controllers/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import checkMemberMiddleware from '../middleware/workspaceMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/:slug/create', authMiddleware, checkMemberMiddleware, addTask);
router.put('/:slug/:id', authMiddleware, checkMemberMiddleware, updateTask);
router.delete('/:slug/:id', authMiddleware, checkMemberMiddleware, deleteTask);
router.get('/:slug/:id', authMiddleware, checkMemberMiddleware, fetchWorkspaceTask);
router.get('/:slug/:id/comments', authMiddleware, checkMemberMiddleware, getTaskComments);
router.post('/:slug/add-comment', authMiddleware, checkMemberMiddleware, addTaskComment);
router.get('/:slug', authMiddleware, checkMemberMiddleware, fetchWorkspaceTasks);

export default router;
