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

    // Attach userId to the request object
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Admin authentication
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user && user.role === 'admin') {
      req.isAdmin = true; // set isAdmin true if user role is admin
      next();
    } else {
      req.isAdmin = false; // set isAdmin false if user role is not admin
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
