const debug = require('debug')('app:notificationUtils');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const sendMail = require('./sendMailUtils');

async function createAndNotify(userId, notificationData) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        error: {
          message: `User with ID ${userId} not found.`,
          status: 404,
          type: 'not found',
        },
      };
    }

    const notification = {
      ...notificationData,
    };

    user.notifications.push(notification);
    await user.save();

    if (notification.sendEmail && user.email) {
      await sendMail(
        user.email,
        notification.title,
        notification.title,
        notification.message
      );
    }

    return {
      notification: {
        userId: user._id,
        username: user.username,
        notification: user.notifications[user.notifications.length - 1],
      },
    };
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return {
        error: {
          message: `invalid User ID`,
          status: 400,
          type: 'validation',
        },
      };
    debug(`failed to create notification: ${error.message}`);
    return {
      error: {
        message: `error creating notification`,
        status: 500,
        type: 'server',
      },
    };
  }
}

module.exports = createAndNotify;
