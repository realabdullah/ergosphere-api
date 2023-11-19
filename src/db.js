import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.log('MongoDB connection error', err);
});

export default mongoose;
