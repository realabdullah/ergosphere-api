import Waitlist from '../models/waitlistModel.js';
import {sendWaitlistConfirmation} from '../services/knock.js';

export const joinWaitlist = async (req, res) => {
    try {
        if (!req.body.email) return res.status(400).json({error: 'Missing required field'});

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
};
