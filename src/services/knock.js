import {Knock} from '@knocklabs/node';
import 'dotenv/config';

const knock = new Knock(process.env.KNOCK_API_KEY);

export const sendWelcomeNotification = async (user) => {
    await knock.workflows.trigger('account-creation', {
        recipients: [
            {
                id: user.username,
                email: user.email,
                name: user.firstName,
            },
        ],
    });
};

export const sendInviteNotification = async (user, workspace, sender, url) => {
    await knock.workflows.trigger('workspace-invitation', {
        data: {
            workspace,
            url,
        },
        recipients: [
            {
                id: user,
                email: user,
            },
        ],
        actor: {
            id: sender.username,
            name: sender.firstName,
            email: sender.email,
        },
    });
};
