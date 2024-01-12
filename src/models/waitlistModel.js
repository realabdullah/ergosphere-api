/* eslint-disable no-invalid-this */
import mongoose from 'mongoose';
import 'dotenv/config';

const waitlistSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    createdAt: {type: Date, default: new Date()},
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
