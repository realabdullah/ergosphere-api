/* eslint-disable no-invalid-this */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import 'dotenv/config';

const ACCESS_TOKEN = {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY,
};
const REFRESH_TOKEN = {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY,
};
const RESET_PASSWORD_TOKEN = {
    expiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY,
};

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    username: {type: String, unique: true, index: true},
    profile_picture: String,
    password: {type: String, required: true},
    token: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    challenge: {type: String, default: ''},
});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.token;
        delete ret.__v;
        delete ret._id;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.challenge;
        return ret;
    },
});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    if (this.isNew) {
        const existingUser = await this.constructor.findOne({
            email: this.email,
        });
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

        const name = `${this.firstName} ${this.lastName}`;
        const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('');

        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
        this.profile_picture = avatarUrl;

        const email = this.email;
        const username = email.split('@')[0];
        const userCount = await this.constructor.countDocuments({username});
        if (userCount > 0) {
            this.username = `${username}${userCount + 1}`;
        } else {
            this.username = username;
        }
    }

    next();
});

UserSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({email});
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    return user;
};

UserSchema.methods.generateAccessToken = async function() {
    const user = this;
    const token = jwt.sign({id: this._id}, ACCESS_TOKEN.secret, {
        expiresIn: ACCESS_TOKEN.expiry,
    });

    const accessTokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    user.token = accessTokenHash;
    await user.save();
    return token;
};

UserSchema.methods.generateRefreshToken = async function() {
    const token = jwt.sign({id: this._id}, REFRESH_TOKEN.secret, {
        expiresIn: REFRESH_TOKEN.expiry,
    });
    return token;
};

UserSchema.methods.generateResetPasswordToken = async function() {
    const token = crypto.randomBytes(20).toString('base64url');
    const secret = crypto.randomBytes(10).toString('hex');
    const user = this;

    const resetToken = `${token}.${secret}`;
    const resetTokenHash = crypto
        .createHmac('sha256', secret)
        .update(token)
        .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires =
    Date.now() + RESET_PASSWORD_TOKEN.expiry * 60 * 1000;

    await user.save();

    return resetToken;
};

const User = mongoose.model('User', UserSchema);

export default User;
