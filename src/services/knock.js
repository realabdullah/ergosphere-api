import {Knock} from '@knocklabs/node';
import 'dotenv/config';

const knock = new Knock(process.env.KNOCK_API_KEY);

export const sendWaitlistConfirmation = async (email) => {
    await knock.workflows.trigger('waitlist-confirmation', {
        recipients: [
            {
                id: email,
                email,
            },
        ],
    });
};
