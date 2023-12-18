/* eslint-disable require-jsdoc */
import express from 'express';
import bodyParser from 'body-parser';
import auth from './routes/authRoutes.js';
import user from './routes/userRoutes.js';
import workspace from './routes/workspaceRoutes.js';
import task from './routes/taskRoutes.js';
import team from './routes/teamRoutes.js';
import invite from './routes/inviteRoutes.js';
import cors from 'cors';
import 'dotenv/config';
// eslint-disable-next-line no-unused-vars
import mongoose from './db.js';

const CommentSchema = new mongoose.Schema({
    message: {
        type: String,
        require: true,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: Date,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', auth);
app.use('/users', user);
app.use('/workspaces', workspace);
app.use('/tasks', task);
app.use('/teams', team);
app.use('/invite', invite);

async function migrateCollections(sourceCollectionName, destinationCollectionName) {
    try {
        const SourceModel = mongoose.model(sourceCollectionName, CommentSchema);
        const DestinationModel = mongoose.model(destinationCollectionName, CommentSchema);

        const documents = await SourceModel.find().lean().exec();
        await DestinationModel.insertMany(documents);

        console.log(`Migration complete: ${documents.length} documents migrated.`);
    } catch (error) {
        console.error('Migration error:', error);
    }
}

await migrateCollections('chats', 'comments');

app.listen(port, () => console.log(`Server is running on port ${port}`));
