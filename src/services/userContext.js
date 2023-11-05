/* eslint-disable require-jsdoc */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/userModel.js';

const ensureAuthorized = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: 'Authorization header is missing',
                success: false,
            });
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({
                message: 'Invalid access token',
                success: false,
            });
        }
        const accessTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        if (user.token !== accessTokenHash) {
            return res.status(401).json({
                message: 'Invalid access token',
                success: false,
            });
        }
        return user;
    } catch (error) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Access token has expired',
                success: false,
            });
        }
        return res.status(401).json({
            message: 'Invalid access token',
            success: false,
        });
    }
};

export default ensureAuthorized;
