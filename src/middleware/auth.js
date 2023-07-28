const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// User authentication
const authenticate = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.header('Authorization').replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, token });

    if (!user) {
      throw new Error();
    }

    // Attach user and token to the request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Admin authentication
const adminOnly = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(403).send({ error: 'Access restricted to administrators.' });
  }
};

module.exports = {
  authenticate,
  adminOnly,
};
