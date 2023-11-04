import express from 'express';
import { register, login, getUser } from '../controllers/user.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Create a new user
router.post('/create', register);

// Login a user
router.post('/login', login);

// Get a user by ID
router.get('/:id', authMiddleware, getUser);

export default router;
