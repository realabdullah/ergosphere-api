/* eslint-disable require-jsdoc */
import mailjet from 'node-mailjet';
import 'dotenv/config';

const mailjetClient = mailjet.Client.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE,
);

async function sendEmail(template, email, subjet) {
    const request = mailjetClient.post('send', {version: 'v3.1'}).request({
        Messages: [
            {
                From: {
                    Email: process.env.MJ_SENDER_EMAIL,
                    Name: process.env.MJ_SENDER_NAME,
                },
                To: [
                    {
                        Email: email,
                    },
                ],
                Subject: subjet,
                HTMLPart: template,
            },
        ],
    });

    try {
        await request;
    } catch (err) {
        console.error('error', err.statusCode, err.message);
    }
}

export default sendEmail;
