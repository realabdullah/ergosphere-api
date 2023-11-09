import express from 'express';
import {inviteUser, acceptInvite} from '../controllers/inviteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', authMiddleware, inviteUser);
router.post('/accept', acceptInvite);

export default router;
