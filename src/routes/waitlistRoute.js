import express from 'express';
import {joinWaitlist} from '../controllers/waitlistController.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/join-waitlist', joinWaitlist);

export default router;
