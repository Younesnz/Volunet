const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const NotificationSchema = new mongoose.Schema({
    title: String,
    message: String,
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const locationSchema = new mongoose.Schema({
    point: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // two items, first longitude, and second latitude
            required: true,
        },
    },
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please provide a valid email',
        ],
    },

    googleID: String,
    first_name: String,
    last_name: String,
    birthDate: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    profile_picture: String,
    location: locationSchema,
    notifications: [NotificationSchema],
    role: {
        type: String,
        enum: ['user', 'admin', 'organization'],
        default: 'user',
    },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
