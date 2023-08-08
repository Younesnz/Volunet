const mongoose = require('mongoose');

// const bcrypt = require('bcryptjs');

const NotificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  sendEmail: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const locationSchema = new mongoose.Schema({
  country: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  city: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
});

const RatedEventSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
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
    lowercase: true,
  },

  googleID: String,
  first_name: {
    type: String,
    lowercase: true,
    trim: true,
  },
  last_name: {
    type: String,
    lowercase: true,
    trim: true,
  },
  birthDate: Date,
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  profilePic: String,
  location: {
    type: locationSchema,
    required: true,
  },
  notifications: [NotificationSchema],
  role: {
    type: String,
    enum: ['user', 'admin', 'organization'],
    default: 'user',
  },

  ratedEvents: [RatedEventSchema],
  likedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  joinedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  createdEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
});

UserSchema.index({ username: 1, email: 1 }, { unique: true }); // enforce unique for username and email

// (From Younes): These functions are already available in UserController so there's no need to have them here too
// UserSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// UserSchema.methods.comparePassword = function (password) {
//   return bcrypt.compare(password, this.password);
// };

const User = mongoose.model('User', UserSchema);

module.exports = User;
