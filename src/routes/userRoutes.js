import express from 'express';
import {editUser, updateProfilePicture, getUser} from '../controllers/userController.js';
import {
    generateRegistrationOptionsWithAuthn, verifyAuthnResponse, removeAuthn, fetchSavedAuthns,
} from '../controllers/authnController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/get', authMiddleware, getUser);
router.post('/edit:user', authMiddleware, editUser);
router.post('/update-profile-picture', authMiddleware, updateProfilePicture);
router.get('/add-authn', authMiddleware, generateRegistrationOptionsWithAuthn);
router.post('/verify-authn', authMiddleware, verifyAuthnResponse);
router.post('/remove-authn', authMiddleware, removeAuthn);
router.get('/authns', authMiddleware, fetchSavedAuthns);

export default router;
