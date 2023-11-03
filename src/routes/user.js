import express from 'express';
import { createUser, getUser } from '../controllers/user.js';

const router = express.Router();

// Create a new user
router.post('/create', createUser);

// Get a user by ID
router.get('/:id', getUser);

export default router;
