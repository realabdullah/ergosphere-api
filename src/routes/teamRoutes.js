import express from 'express';
import {getWorkspaceTeam} from '../controllers/teamController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/:slug', authMiddleware, getWorkspaceTeam);

export default router;
