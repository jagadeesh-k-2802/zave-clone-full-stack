const formidable = require('formidable');
const { promises: fs } = require('fs');
const path = require('path');
const User = require('../models/User');
const Group = require('../models/Group');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const Email = require('../utils/email');
const ErrorResponse = require('../utils/errorResponse');
const { getRandomInt } = require('../utils/functions');

/**
 * @route POST /auth/login
 * @desc let's the user login
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  // User Not Found In DB
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isPasswordMatched = await user.matchPassword(password);

  // Wrong Password
  if (!isPasswordMatched) {
    return next(new ErrorResponse('Invalid Email Or Password', 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @route POST /auth/signup
 * @desc let's the user signup
 */
exports.signup = catchAsync(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const avatar = `default-avatar-${getRandomInt(1, 5)}.jpg`;
  const user = await User.create({
    fullname,
    username,
    avatar,
    email,
    password
  });

  await Group.create({
    name: 'Social',
    color: '#4ad97f',
    user: user.id
  });

  await Group.create({
    name: 'Reading List',
    color: '#4199ff',
    user: user.id
  });

  const url = `${req.protocol}://${req.get('host')}/dashboard`;
  await new Email(user, url).sendWelcome();
  sendTokenResponse(user, 200, res);
});

/**
 * @route GET /auth/logout
 * @desc let's the user logout
 */
exports.logout = catchAsync((req, res) => {
  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  };

  res.status(200).cookie('token', 'none', options).redirect('/');
});

/**
 * @route POST /auth/forgot-password
 * @desc Sends a mail with reset token to the given email address
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorResponse('No User found with that email address', 404)
    );
  }

  const token = user.getResetPasswordToken();
  const url = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

  try {
    await new Email(user, url).sendPasswordReset();
    res.status(200).json({ success: true, msg: 'Email Sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorResponse('Could not send email', 500));
  }

  await user.save();
});

/**
 * @route POST /auth/reset-password/:token
 * @desc Resets a user's password when requested with right reset token
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

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
    return next(
      new ErrorResponse('Invalid token maybe your time expired', 404)
    );
  }

  // Update user with new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @route POST /auth/update-details
 * @desc Updates user's details
 */
exports.updateDetails = catchAsync(async (req, res) => {
  const { fullname, username, bio, socialProfiles } = req.body;
  const { facebook, twitter, instagram, producthunt } = socialProfiles;
  const user = req.user;

  const fieldsToUpdate = {
    fullname,
    username,
    bio,
    socialProfiles: {
      facebook,
      twitter,
      instagram,
      producthunt
    }
  };

  await User.findByIdAndUpdate(user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({ success: true });
});

/**
 * @route POST /auth/update-visibility
 * @desc Updates user's profile visiblity
 */
exports.updateVisibility = catchAsync(async (req, res) => {
  const { profileVisibility } = req.body;
  const user = req.user;
  const fieldsToUpdate = { profileVisibility };

  await User.findByIdAndUpdate(user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({ success: true });
});

/**
 * @route POST /auth/update-password
 * @desc Updates user's password
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @route POST /auth/update-avatar
 * @desc Updates user's avatar
 */
exports.updateAvatar = catchAsync(async (req, res, next) => {
  const form = formidable();
  const user = req.user;
  const filename = `${user.username}.jpg`;

  // Move The File From Temp To Avatar Dir
  const moveFromTemp = async file => {
    try {
      const dest = path.join(__dirname, '../public/avatar', filename);
      await fs.rename(file.avatar.path, dest);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // Parse form
  form.parse(req, (err, fields, file) => {
    if (err) {
      return next(err);
    }

    moveFromTemp(file);
  });

  const fieldsToUpdate = { avatar: filename };

  // Update user in DB
  await User.findByIdAndUpdate(user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({ success: true });
});

/**
 * @route POST /auth/request-delete
 * @desc sends a mail to Delete a user's account
 */
exports.requestDelete = catchAsync(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorResponse('No User found with that email address', 404)
    );
  }

  const token = user.getDeleteAccountToken();
  const url = `${req.protocol}://${req.get('host')}/delete-account/${token}`;

  try {
    await new Email(user, url).sendDeleteRequest();
    res.status(200).json({ success: true, msg: 'Email Sent' });
  } catch (err) {
    console.log(err);
    user.deletePasswordToken = undefined;
    user.deletePasswordExpire = undefined;
    await user.save();
    return next(new ErrorResponse('Could not send email', 500));
  }

  await user.save();
});

/**
 * @route DELETE /auth/delete-account
 * @desc Deletes a user's account permanently from database
 */
exports.deleteAccount = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  await user.remove();

  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  };

  res.status(200).cookie('token', 'none', options).redirect('/');
});

// Creates a JWT Token and returns it in a cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });
};
