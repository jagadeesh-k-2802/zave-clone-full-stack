const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

const isAuthenticated = async req => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  } else {
    // No Token
    return false;
  }

  // JWT Verification
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    return true;
  } catch (err) {
    return false;
  }
};

const protect = catchAsync(async (req, res, next) => {
  if (await isAuthenticated(req)) {
    next();
  } else {
    next(new ErrorResponse('Not Authorized To Access This Route', 401));
  }
});

const redirect = ({ ifAuth }) => {
  return catchAsync(async (req, res, next) => {
    if (ifAuth) {
      // Redirect If Authenicated
      if (await isAuthenticated(req)) {
        res.status(301).redirect('/dashboard');
      } else {
        next();
      }
    } else {
      // Redirect If Not Authenicated
      if (!(await isAuthenticated(req))) {
        res.status(301).redirect('/login');
      } else {
        next();
      }
    }
  });
};

module.exports = { protect, redirect, isAuthenticated };
