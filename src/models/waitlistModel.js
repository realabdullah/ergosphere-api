/* eslint-disable no-invalid-this */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import 'dotenv/config';

const waitlistSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    waitlistToken: {type: String, unique: true},
    waitlistTokenHash: {type: String, unique: true},
    createdAt: {type: Date, default: new Date()},
});

waitlistSchema.pre('save', function(next) {
    if (this.isNew) {
        const token = jwt.sign({email: this.email}, process.env.JWT_SECRET);

        const waitlistTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        this.waitlistTokenHash = waitlistTokenHash;
        this.waitlistToken = token;
    }

    next();
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
