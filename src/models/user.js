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
    username: {
        type: String,
        unique: true,
        index: true,
    },
    profile_picture: String,
    password: {
        type: String,
        required: true,
    },
    tokens: [{
       token: {
           type: String,
           required: true,
       },
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

// SET SCHEMA OPTION
UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.tokens;
        delete ret.__v;
        return ret;
    },
});

// perform actions before saving the user
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    if (this.isNew) {
        // Check if user with same email already exists
        const existingUser = await this.constructor.findOne({ email: this.email });
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

        // Get initials from user's name
        const name = `${this.firstName} ${this.lastName}`;
        const initials = name.split(' ').map(n => n[0]).join('');

        // Generate user avatar using useravatar URL
        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;

        // Set profile picture to generated avatar URL
        this.profile_picture = avatarUrl;

        // Generate username from email
        const email = this.email;
        const username = email.split('@')[0];
        const userCount = await this.constructor.countDocuments({ username });
        if (userCount > 0) {
            this.username = `${username}${userCount + 1}`;
        } else {
            this.username = username;
        }
    }

    next();
});


// Find user by email and password
UserSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    return user;
};

// Generate access token
UserSchema.methods.generateAccessToken = async function() {
    const token = jwt.sign({ id: this._id }, ACCESS_TOKEN.secret, { expiresIn: ACCESS_TOKEN.expiry });
    return token;
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = async function() {
    const user = this;
    const token = jwt.sign({ id: this._id }, REFRESH_TOKEN.secret, { expiresIn: REFRESH_TOKEN.expiry });

    const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.tokens.push({ token: refreshTokenHash });
    await user.save();
    return token;
}

// Generate reset password token
UserSchema.methods.generateResetPasswordToken = async function() {
    const token = crypto.randomBytes(20).toString('base64url');
    const secret = crypto.randomBytes(10).toString('hex');
    const user = this;

    const resetToken = `${token}.${secret}`;
    const resetTokenHash = crypto.createHmac('sha256', secret).update(token).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + (RESET_PASSWORD_TOKEN.expiry * 60 * 1000);

    await user.save();

    return resetToken;
}

const User = mongoose.model('User', UserSchema);

export default User;
