/* eslint-disable no-invalid-this */
import mongoose from 'mongoose';

const AuthnSchema = new mongoose.Schema({
    device: {
        type: String,
        required: true,
    },
    credentialID: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    counter: {
        type: Number,
        required: true,
    },
    transports: {
        type: Array,
        default: ['internal'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

AuthnSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        delete ret.credentialID;
        delete ret.publicKey;
        delete ret.counter;
        delete ret.transports;
        delete ret.user;
        return ret;
    },
});

const Authn = mongoose.model('Authn', AuthnSchema);

export default Authn;
