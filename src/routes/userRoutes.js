import express from 'express';
import {register, login, logout, refresh, editUser, updateProfilePicture} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/create', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.post('/edit:user', authMiddleware, editUser);
router.post('/update-profile-picture', authMiddleware, updateProfilePicture);

export default router;
