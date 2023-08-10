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

    let email = {};
    if (notification.sendEmail && user.email) {
      email = await sendMail({
        to: user.email,
        subject: notification.subject
          ? notification.subject
          : notification.title,
        title: notification.title,
        text: notification.message,
        username: user.username,
        name: user.first_name,
        action: notification.action,
      });
    }

    return {
      notification: {
        userId: user._id,
        username: user.username,
        notification: user.notifications[user.notifications.length - 1],
        email,
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

const emails = {
  welcome: {
    title: 'Welcome to Volunet!',
    message: `We're thrilled to have you on board. Start making a difference today by joining events or crafting your own. Our team will review your creations, connecting you with a vibrant community of fellow volunteers and organizations striving for positive change.
    Together, let's transform lives through action!`,
    sendEmail: true,
    subject: "Welcome to Volunet's Community!",
    action: 'Browse our free events here',
  },
  eventCreated: {
    title: 'Your Event has been Created!',
    message:
      "Congratulations on creating your event! You've taken the first step towards positive change. Your event is now under review by our team. We'll notify you once it's approved and live on the platform.",
    sendEmail: true,
    subject: 'Your Event Submission',
    action: 'Manage Your Events',
  },
  joinedToEvent: {
    title: "You've Joined an Event!",
    message:
      'Thank you for joining an event. Your commitment to positive change is appreciated. Get ready to make a difference and connect with like-minded volunteers. Check out event details and stay engaged!',
    sendEmail: true,
    subject: 'Event Participation Confirmation',
    action: 'View Event Details',
  },
  leftEvent: {
    title: "You've Left an Event",
    message:
      "We're sorry to see you go. If you change your mind, you're always welcome to rejoin the event and continue contributing to the community's efforts for positive change.",
    sendEmail: true,
    subject: 'Event Participation Update',
    action: 'Explore Other Events',
  },
  applicationAccepted: {
    title: 'Your Application is Accepted!',
    message:
      "Congratulations! Your application has been accepted. You're now part of the team for the event. Your dedication to this cause is commendable. Let's work together to create an impact!",
    sendEmail: true,
    subject: 'Application Status: Accepted',
    action: 'View Event Details',
  },
  applicationRejected: {
    title: 'Your Application is Rejected',
    message:
      "We appreciate your interest, but unfortunately, your application for the event has been rejected. Don't be discouraged; there are plenty of other opportunities to get involved.Click on the link below to learn why we have decided to reject your event.",
    sendEmail: true,
    subject: 'Application Status: Rejected',
    action: 'Learn more',
  },
  applicationUpdated: {
    title: 'Update on Your Application',
    message:
      "There's an update on your application for the event. Please log in to your account to view the details and status of your application.",
    sendEmail: true,
    subject: 'Application Status Update',
    action: 'Check Application Status',
  },
  reportReceived: {
    title: 'Report Received',
    message:
      "Thank you for reporting an event that violates our community guidelines. We take your concerns seriously and are investigating the matter. We'll keep you informed of any actions taken.",
    sendEmail: true,
    subject: 'Report Acknowledgement',
    action: 'Our Community Safety Guidlines',
  },
  reportReviewed: {
    title: 'Report Reviewed',
    message:
      "We've reviewed the report you submitted regarding a violation of community guidelines. Appropriate actions have been taken, and we appreciate your vigilance in helping us maintain a safe environment.Click on the link below to see more information.",
    sendEmail: true,
    subject: 'Report Outcome',
    action: 'See Your Report Review',
  },
};
exports.notify = createAndNotify;
exports.emails = emails;
