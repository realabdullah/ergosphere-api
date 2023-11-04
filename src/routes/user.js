import express from 'express';
import {register, login, refresh} from '../controllers/user.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/create', register);
router.post('/login', login);
router.post('/refresh', refresh);

export default router;
