const User = require('../models/User');
const Group = require('../models/Group');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');

/**
 * @route GET /
 * @desc Gets the home page
 */
exports.getHomePage = (req, res) => {
  res.status(200).render('pages/index', { user: req.user });
};

/**
 * @route GET /terms
 * @desc Gets the terms page
 */
exports.getTermsPage = (req, res) => {
  res.status(200).render('pages/terms', { user: req.user });
};

/**
 * @route GET /privacy
 * @desc Gets the privacy page
 */
exports.getPrivacyPage = (req, res) => {
  res.status(200).render('pages/privacy', { user: req.user });
};

/**
 * @route GET /about
 * @desc Gets the about page
 */
exports.getAboutPage = (req, res) => {
  res.status(200).render('pages/about', { user: req.user });
};

/**
 * @route GET /dashboard
 * @desc Gets the dashboard page
 */
exports.getDashboardPage = catchAsync(async (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const groups = await Group.find({ user: req.user.id });
  const layout = req.cookies.layout || 'grid';

  res
    .status(200)
    .render('pages/dashboard', { user: req.user, host, groups, layout });
});

/**
 * @route GET /:id
 * @desc Gets the profile page
 */
exports.getProfilePage = catchAsync(async (req, res) => {
  const { username } = req.params;
  const host = `${req.protocol}://${req.get('host')}`;
  const layout = req.cookies.layout || 'grid';
  const profile = await User.findOne({ username });

  // User not found or hidden
  if (!profile || profile.profileVisibility === 'hidden' && req.user.id !== profile.id) {
    return res.status(200).render('pages/404', { user: req.user, host });
  }

  // Get public groups of that user
  const groups = await Group.find({
    user: profile.id,
    groupVisibility: 'visible'
  });

  res
    .status(200)
    .render('pages/profile', { user: req.user, host, profile, groups, layout });
});

/**
 * @route GET /settings
 * @desc Gets the settings page
 */
exports.getSettingsPage = (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.status(200).render('pages/settings', { user: req.user, host });
};

/**
 * @route GET /login
 * @desc Gets the login page
 */
exports.getLoginPage = (req, res) => {
  res.status(200).render('pages/login', { user: req.user });
};

/**
 * @route GET /signup
 * @desc Gets the signup page
 */
exports.getSignupPage = (req, res) => {
  res.status(200).render('pages/sign-up', { user: req.user });
};

/**
 * @route GET /forgot-password
 * @desc Gets the forgot-password page
 */
exports.getForgotPasswordPage = (req, res) => {
  res.status(200).render('pages/forgot-password', { user: req.user });
};

/**
 * @route GET /reset-password/:token
 * @desc Gets the reset-password page
 */
exports.getResetPasswordPage = catchAsync(async (req, res) => {
  const { token } = req.params;
  const host = `${req.protocol}://${req.get('host')}`;

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find The Hashed version
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  // Token expired or invalid token
  if (!user) {
    return res.status(400).render('pages/404', { user: req.user, host });
  }

  res.status(200).render('pages/reset-password', { user: req.user, host });
});

/**
 * @route GET /delete-account/:token
 * @desc Gets the delete-account page
 */
exports.getDeleteAccountPage = catchAsync(async (req, res) => {
  const { token } = req.params;
  const host = `${req.protocol}://${req.get('host')}`;

  const deleteAccountToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find The Hashed version
  const user = await User.findOne({
    deleteAccountToken,
    deleteAccountExpire: { $gt: Date.now() }
  });

  // Token expired or invalid token
  if (!user) {
    return res.status(400).render('pages/404', { user: req.user, host });
  }

  res.status(200).render('pages/delete-account', { user: req.user, host });
});
