import mongoose from 'mongoose';


const inviteSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
});

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;
