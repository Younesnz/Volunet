const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const { errorResponse } = require('../utils/responseUtils');
// User authentication
const authenticate = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.header('Authorization');

    if (!token) throw new Error('Token required');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    // Check if the token has expired (based on "iat" field)
    const expireIn = 30 * 24 * 60 * 60; // 30 days in seconds
    const now = Math.floor(Date.now() / 1000);
    if (now - expireIn > decoded.iat) throw new Error('Token has expired');

    if (!user) throw new Error('Invalid Token');

    // Attach userId and isAdmin to the request object
    req.userId = user._id;
    req.isAdmin = user.role === 'admin';
    next();
  } catch (error) {
    return res
      .status(401)
      .json(errorResponse(error.message, 401, 'unauthorized'));
  }

  return null;
};

// Admin authentication
const adminOnly = async (req, res, next) => {
  try {
    if (req.isAdmin) next();
    else throw new Error();
  } catch (error) {
    return res
      .status(403)
      .json(errorResponse('Access denied!', 403, 'forbidden'));
  }

  return null;
};

module.exports = {
  authenticate,
  adminOnly,
};
