import {Resend} from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_KEY);

export const sendEmail = async ({to, subject, html}) => {
    try {
        const res = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        if (res.error) throw new Error(res.error);
        console.log('Message sent: %s', res.data);
    } catch (error) {
        console.error('Error sending mail: ', error);
    }
};
