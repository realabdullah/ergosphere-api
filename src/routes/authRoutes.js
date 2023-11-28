import express from 'express';
import {
    register, login, logout, refresh,
} from '../controllers/userController.js';
import {requestLoginWithAuthn, loginWithAuthn} from '../controllers/authnController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/create', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.post('/request-authn-login', requestLoginWithAuthn);
router.post('/authn-login', loginWithAuthn);

export default router;
