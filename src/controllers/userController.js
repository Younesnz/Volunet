const debug = require('debug')('app:userController');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const bcrypt = require('bcryptjs');
const passwordComplexity = require('joi-password-complexity');

const User = require('../models/userModel');
const { notify, emails } = require('../utils/notificationUtils');
const {
  success,
  validationError,
  errorResponse,
} = require('../utils/responseUtils');

// Define validation

const registerSchema = Joi.object({
  username: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(50).required(),
  first_name: Joi.string().max(20),
  last_name: Joi.string().max(20),
  birthDate: Joi.date().iso(),
  profilePic: Joi.string(),
  country: Joi.string().max(20).required(),
  city: Joi.string().max(20).required(),
});

let updateUserSchema = Joi.object({
  username: Joi.string().min(4).max(30),
  email: Joi.string().email(),
  first_name: Joi.string().max(20),
  last_name: Joi.string().max(20),
  birthDate: Joi.date().iso(),
  profilePic: Joi.string(),
  country: Joi.string().max(20),
  city: Joi.string().max(20),
})
  .min(1)
  .message('At least one field must be provided.');
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json(validationError(error, error.details[0].message));
  }

  const { error: passwordError } = passwordComplexity({
    min: 8,
    max: 50,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 0,
    requirementCount: 3,
  }).validate(req.body.password);

  if (passwordError)
    return res
      .status(400)
      .json(
        validationError(
          passwordError,
          'Password should be at least 8 characters long, including both uppercase and lowercase letters, and at least one number.'
        )
      );

  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      ...req.body,
      password: hashedPassword,
      location: {
        city: req.body.city,
        country: req.body.country,
      },
    });

    const result = await user.save();
    notify(user._id, emails.welcome);
    return res
      .status(201)
      .json(
        success(
          { username: result.username, email: result.email },
          'User registered successfully'
        )
      );
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json(
          validationError(
            err,
            `${err.keyPattern.username ? 'Username' : 'Email'} already exists.`
          )
        );
    debug(`Error in registerUser: ${err}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! failed to register the User.')
      );
  }
};

exports.loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json(validationError(error, error.details[0].message));
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res
        .status(401)
        .json(errorResponse('Invalid email or password', 401, 'unauthorized'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(errorResponse('Invalid email or password', 401, 'unauthorized'));
    }

    const { _id: id, username } = user;
    const token = jwt.sign({ id }, process.env.JWT_SECRET);

    return res.json(
      success(
        {
          token,
          user: {
            id,
            username,
            email,
          },
        },
        'user logged in successfully.'
      )
    );
  } catch (err) {
    debug(`Error in loginUser: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! failed to login the User.'));
  }
};

// Authenticated User Controllers

exports.getUserProfile = async (req, res) => {
  let userId;

  // Check if :id parameter is present (admin accessing another user's profile)
  if (req.params.id) {
    userId = req.params.id;
  } else {
    // Assuming req.userId is set from the authMiddleware for regular users and admins accessing their own profile
    userId = req.userId;
  }

  try {
    const user = await User.findById(userId)
      .select('-password -__v')
      .populate({
        path: 'likedEvents',
        select:
          'title description category type date pictures likes rating ratingCount registeredCount',
      })
      .populate({
        path: 'joinedEvents',
        select:
          'title description category type date pictures likes rating ratingCount registeredCount',
      })
      .populate({
        path: 'createdEvents',
        select:
          'title description category type date pictures likes rating ratingCount registeredCount applicationId',
        populate: {
          path: 'applicationId',
          select: 'status',
        },
      });
    if (!user) {
      return res
        .status(404)
        .json(
          errorResponse(`User with ID ${userId} not found!`, 404, 'not found')
        );
    }

    // Additional check to restrict non-admins from accessing other users' profiles
    if (!req.isAdmin && userId !== req.userId) {
      return res.status(403).json(errorResponse('Access denied!', 403));
    }

    return res
      .status(200)
      .json(success(user, 'User profile fetched successfully'));
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${userId}`, 400, 'validation'));
    }

    debug(`Error in getUserProfile: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to fetch user data.'));
  }
};

// TODO: password should be changed in another endpoint
exports.updateUserProfile = async (req, res) => {
  let userId;

  // Check if :id parameter is present (admin updating another user's profile)
  if (req.params.id) {
    userId = req.params.id;
  } else {
    // Assuming req.userId is set from the authMiddleware for regular users and admins updating their own profile
    userId = req.userId;
  }

  try {
    if (req.isAdmin)
      // Add ability to update role or isVerified by Admins
      updateUserSchema = updateUserSchema.append({
        role: Joi.string().valid('user', 'admin', 'organization'),
        isVerified: Joi.boolean(),
      });
    const { error } = updateUserSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    // Additional check to restrict non-admins from updating other users' profiles
    if (!req.isAdmin && userId !== req.userId) {
      return res.status(403).json(errorResponse('Access denied!', 403));
    }

    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).select('-password -__v');

    if (!user)
      return res
        .status(404)
        .json(
          errorResponse(`User with ID ${userId} not found!`, 404, 'not found')
        );

    return res
      .status(200)
      .json(success(user, 'User profile updated successfully'));
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json(
          validationError(
            err,
            `${err.keyPattern.username ? 'Username' : 'Email'} already exists.`
          )
        );
    if (err instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${userId}`, 400, 'validation'));

    debug(`Error in updateUserProfile: ${err}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! Failed to update user data.')
      );
  }
};

// Admin Controllers

const filterSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().min(3).max(50),
  name: Joi.string().min(3).max(50),
  olderThan: Joi.number().integer().min(0).max(100),
  youngerThan: Joi.number().integer().min(0).max(100),
  joinedBefore: Joi.date().iso(),
  joinedAfter: Joi.date().iso(),
  isVerified: Joi.boolean(),
  role: Joi.string().valid('user', 'admin', 'organization'),
  country: Joi.string().max(20),
  city: Joi.string().max(20),
  hasRated: Joi.objectId(),
  hasLiked: Joi.objectId(),
  hasJoined: Joi.objectId(),
  limit: Joi.number().integer().min(1).max(100),
});

exports.getUsers = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json(errorResponse('Access denied!', 403));
    }

    const { error } = filterSchema.validate(req.query);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    const query = {};

    if (req.query.username)
      query.username = { $regex: new RegExp(req.query.username, 'i') };

    if (req.query.email)
      query.email = { $regex: new RegExp(req.query.email, 'i') };

    if (req.query.name)
      query.$or = [
        { first_name: { $regex: new RegExp(req.query.name, 'i') } },
        { last_name: { $regex: new RegExp(req.query.name, 'i') } },
      ];

    if (req.query.olderThan)
      query.birthDate = {
        $lt: new Date(
          Date.now() - req.query.olderThan * 365 * 24 * 60 * 60 * 1000
        ),
      };

    if (req.query.youngerThan)
      query.birthDate = {
        ...(query.birthDate || {}),
        $gt: new Date(
          Date.now() - req.query.youngerThan * 365 * 24 * 60 * 60 * 1000
        ),
      };

    if (req.query.joinedBefore)
      query.joinedAt = { $lt: new Date(req.query.joinedBefore) };

    if (req.query.joinedAfter)
      query.joinedAt = {
        ...(query.joinedAt || {}),
        $gt: new Date(req.query.joinedAfter),
      };

    if (req.query.isVerified !== undefined)
      query.isVerified = req.query.isVerified;

    if (req.query.role) query.role = req.query.role;

    if (req.query.country) query['location.country'] = req.query.country;

    if (req.query.city) query['location.city'] = req.query.city;

    if (req.query.hasRated)
      query['ratedEvents.eventId'] = { $in: [req.query.hasRated] };

    if (req.query.hasLiked) query.likedEvents = { $in: [req.query.hasLiked] };

    if (req.query.hasJoined)
      query.joinedEvents = { $in: [req.query.hasJoined] };

    const limit = req.query.limit || 50;

    const users = await User.find(query).limit(limit);

    return res
      .status(200)
      .json(success(users, `${users.length} user(s) found`));
  } catch (err) {
    debug(`Error in getUsers: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to fetch users'));
  }
};

exports.deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin) {
      return res.status(403).json(errorResponse('Access denied!', 403));
    }

    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json(
          errorResponse(`User with id ${id} does not exist.`, 404, 'not found')
        );
    return res.status(200).json(success(user, 'User deleted successfully.'));
  } catch (err) {
    if (err instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${id}`, 400, 'validation'));

    debug(`Error in deleteUserById: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to delete user'));
  }
};

exports.getUserNotifications = async (req, res) => {
  const id = req.userId; // from authMiddleware
  try {
    const notifications = await User.findById(id, { notifications: 1 });
    if (!notifications)
      return res
        .status(404)
        .json(errorResponse('User not found.', 404, 'not found'));
    return res
      .status(200)
      .json(success(notifications, 'fetched user notifications.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${id}`, 400, 'validation'));
    debug(`Error in getUserNotifications: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! Failed to fetch user notifications.'
        )
      );
  }
};

const notificationSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  message: Joi.string().min(3).max(500).required(),
  sendEmail: Joi.boolean(),
});

exports.createNotification = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.isAdmin !== true)
      // double check admin
      return res.status(403).json(errorResponse('Access denied!', 403));
    const { error } = notificationSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    const { error: notifError, notification } = await notify(id, req.body);

    if (notifError)
      return res
        .status(notifError.status)
        .json(
          errorResponse(notifError.message, notifError.status, notifError.type)
        );
    return res.status(201).json(success(notification, 'Notification created.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${id}`, 400, 'validation'));
    debug(`Error in createNotification: ${error}`);
    return res
      .status(500)
      .json('Internal server error. failed to create notification.');
  }
};
exports.deleteNotification = async (req, res) => {
  const { userId, notifId } = req.params;
  try {
    if (req.isAdmin !== true)
      // double check admin
      return res.status(403).json(errorResponse('Access denied!', 403));
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { notifications: { _id: notifId } },
      },
      { new: true }
    ).select('_id notifications');
    if (!result)
      return res
        .status(404)
        .json(
          errorResponse(`User or Notification Not found`, 404, 'not found')
        );
    return res.status(200).json(success(result, 'Notification deleted.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${userId}`, 400, 'validation'));
    debug(`Error in deleteNotification: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal server error. failed to delete notification.')
      );
  }
};
