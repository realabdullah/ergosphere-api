import express from 'express';
import {addNotification, deleteNotification, getNotifications} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/:userId', authMiddleware, getNotifications);
router.post('/', authMiddleware, addNotification);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
