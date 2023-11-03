import express from 'express';
import bodyParser from 'body-parser';
import user from './routes/user.js';
import mongoose from './db.js';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/users', user);

app.listen(port, () => console.log(`Server is running on port ${port}`));
