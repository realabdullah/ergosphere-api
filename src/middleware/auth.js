/* eslint-disable require-jsdoc */

import jwt from 'jsonwebtoken';
import 'dotenv/config';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization header is missing',
            success: false,
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedToken;
        next();
    } catch (err) {
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
}

export default authMiddleware;
