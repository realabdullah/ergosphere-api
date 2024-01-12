/* eslint-disable require-jsdoc */
import express from 'express';
import bodyParser from 'body-parser';
import Waitlist from './models/waitlistModel.js';
import cors from 'cors';
import 'dotenv/config';
import {sendWaitlistConfirmation} from './services/knock.js';
// eslint-disable-next-line no-unused-vars
import mongoose from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/waitlist', async (req, res) => {
    try {
        const {email} = req.body;

        const existingEntry = await Waitlist.findOne({email});
        if (existingEntry) {
            return res.status(400).json({error: 'Email already on the waitlist.'});
        }

        const waitlistEntry = new Waitlist({email});
        await waitlistEntry.save();

        await sendWaitlistConfirmation(email);
        res.json({message: 'Added to waitlist successfully'});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
