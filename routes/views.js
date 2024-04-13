const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/views');
const catchAsync = require('../utils/catchAsync');
const { redirect, isAuthenticated } = require('../middlewares/auth');

// Inject user object in req.user
router.use(
  catchAsync(async (req, res, next) => {
    await isAuthenticated(req);
    next();
  })
);

// Static Pages
router.get('/', viewsController.getHomePage);
router.get('/terms', viewsController.getTermsPage);
router.get('/privacy', viewsController.getPrivacyPage);
router.get('/about', viewsController.getAboutPage);

// Private Pages
router.get('/dashboard', redirect({ ifAuth: false }), viewsController.getDashboardPage);
router.get('/settings', redirect({ ifAuth: false }), viewsController.getSettingsPage);

// Auth Pages
router.get('/login', redirect({ ifAuth: true }), viewsController.getLoginPage);
router.get('/signup', redirect({ ifAuth: true }), viewsController.getSignupPage);
router.get('/forgot-password', viewsController.getForgotPasswordPage);
router.get('/delete-account/:token', redirect({ ifAuth: false }), viewsController.getDeleteAccountPage);
router.get('/reset-password/:token', redirect({ ifAuth: false }), viewsController.getResetPasswordPage);

// Anyone Can View
router.get('/:username', viewsController.getProfilePage);

module.exports = router;
