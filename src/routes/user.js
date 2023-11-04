import express from 'express';
import {register, login, logout, refresh} from '../controllers/user.js';
import authMiddleware from '../middleware/auth.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/create', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
