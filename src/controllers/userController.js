const debug = require('debug')('app:userController');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const bcrypt = require('bcryptjs');
const passwordComplexity = require('joi-password-complexity');

const User = require('../models/userModel');

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

const updateUserSchema = Joi.object({
  username: Joi.string().min(4).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(50),
  first_name: Joi.string().max(20),
  last_name: Joi.string().max(20),
  birthDate: Joi.date().iso(),
  profilePic: Joi.string(),
  country: Joi.string().max(20),
  city: Joi.string().max(20),
  lon: Joi.number().min(-180).max(180),
  lat: Joi.number().min(-90).max(90),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// TODO: check email and username and see if they're already exist
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
    });

    const result = await user.save();
    return res
      .status(201)
      .json(success(result, 'User registered successfully'));
  } catch (err) {
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
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res
        .status(401)
        .json(errorResponse('Invalid email or password', 401));
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json(errorResponse('Invalid email or password', 401));
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
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res
        .status(404)
        .json(errorResponse(`User with ID ${userId} not found!`, 404));
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
        .json(errorResponse(`Invalid User ID: ${userId}`, 400));
    }

    debug(`Error in getUserProfile: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to fetch user data.'));
  }
};

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
    });

    if (!user)
      return res
        .status(404)
        .json(errorResponse(`User with ID ${userId} not found!`, 404));

    return res
      .status(200)
      .json(success(user, 'User profile updated successfully'));
  } catch (err) {
    if (err instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${userId}`, 400));

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
  olderThan: Joi.number().min(0).max(100),
  youngerThan: Joi.number().min(0).max(100),
  joinedBefore: Joi.date().timestamp(),
  joinedAfter: Joi.date().timestamp(),
  isVerified: Joi.boolean(),
  role: Joi.string().valid('user', 'admin', 'organization'),
  country: Joi.string().max(20),
  city: Joi.string().max(20),
  hasRated: Joi.objectId(),
  hasLiked: Joi.objectId(),
  hasJoined: Joi.objectId(),
  limit: Joi.number().min(1).max(100),
});

exports.getUsers = async (req, res) => {
  try {
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
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json(errorResponse(`User with id ${id} does not exist.`, 404));
    return res.status(200).json(success(user, 'User deleted successfully.'));
  } catch (err) {
    if (err instanceof mongoose.CastError)
      return res.status(400).json(errorResponse(`Invalid User ID: ${id}`, 400));

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
        .json(errorResponse('Notifications not found.', 404));
    return res
      .status(200)
      .json(success(notifications, 'Notifications fetched.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res.status(400).json(errorResponse(`Invalid User ID: ${id}`));
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
    const result = await User.findByIdAndUpdate(id, {
      $push: { notifications: req.body },
    });
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`User with ID ${id} does not exist.`));
    return res.status(201).json(success(result, 'Notification created.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res.status(400).json(errorResponse(`Invalid User ID: ${id}`, 400));
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
    const result = await User.findByIdAndUpdate(userId, {
      $pull: { notifications: { _id: notifId } },
    });
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`User or Notification Not found`));
    return res.status(200).json(success(result, 'Notification deleted.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid User ID: ${userId}`, 400));
    debug(`Error in deleteNotification: ${error}`);
    return res
      .status(500)
      .json('Internal server error. failed to delete notification.');
  }
};
