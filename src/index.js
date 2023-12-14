import express from 'express';
import bodyParser from 'body-parser';
import Task from './models/taskModel.js';
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

// eslint-disable-next-line require-jsdoc
async function migrateAssigneesToAssignee() {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const documentsToUpdate = await Task.find({});

        for (const document of documentsToUpdate) {
            // Update assignee field with the first assignee from assignees array
            document.assignee = document.assignees[0] || null; // Set to null if assignees array is empty

            // Remove assignees array
            await Task.findOneAndUpdate(
                {_id: document._id},
                {$unset: {assignees: 1}},
                {new: true},
            );
            // Save the document
            await document.save();
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.disconnect();
    }
}

await migrateAssigneesToAssignee();
app.listen(port, () => console.log(`Server is running on port ${port}`));
