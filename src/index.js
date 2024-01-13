/* eslint-disable require-jsdoc */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import waitlist from './routes/waitlistRoute.js';
import 'dotenv/config';
// eslint-disable-next-line no-unused-vars
import mongoose from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/', waitlist);

app.listen(port, () => console.log(`Server is running on port ${port}`));
