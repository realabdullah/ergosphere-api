/* eslint-disable require-jsdoc */
import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendEmail = async ({to, subject, html}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.ELASTIC_EMAIL_SERVER,
            port: process.env.ELASTIC_EMAIL_PORT,
            auth: {
                user: process.env.ELASTIC_EMAIL_USERNAME,
                pass: process.env.ELASTIC_EMAIL_PASSWORD,
            },
        });

        const info = await transporter.sendMail({from: process.env.EMAIL_FROM, to, subject, html});

        console.log('Message sent: %s', info);
    } catch (error) {
        console.error('Error: ', error);
    }
};
