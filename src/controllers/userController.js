const debug = require('debug')('app:userController');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const passwordComplexity = require('joi-password-complexity');

const User = require('../models/userModel');
const { Application } = require('../models/applicationModel');
const { Event } = require('../models/eventModel');

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

  const { username, email, password } = req.body;

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
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password -__v');
    if (!user) res.status(404).json(errorResponse('User not found!'));
    return res
      .status(200)
      .json(success(user, 'User profile fetched successfully'));
  } catch (err) {
    if (err instanceof mongoose.CastError)
      return res.status(400).json(errorResponse('Invalid User ID!', 400));

    debug(`Error in getUserProfile: ${err}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! failed to fetch user data.'));
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json(errorResponse(`User with ID ${id} not found!`));

    return res
      .status(200)
      .json(success(user, 'User profile updated successfully'));
  } catch (err) {
    if (err instanceof mongoose.CastError)
      return res.status(400).json(errorResponse('Invalid User ID!', 400));

    debug(`Error in updateUserProfile: ${err}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! failed to update user data.')
      );
  }
};

// Admin Controllers

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find(req.query);

    return res.json(users);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw Error('User does not exist');
    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) throw Error('User does not exist');
    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw Error('User does not exist');
    res.json({ msg: 'User deleted successfully' });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
};
