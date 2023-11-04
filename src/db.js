import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/ergosphere').then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.log('MongoDB connection error', err);
});

export default mongoose;
