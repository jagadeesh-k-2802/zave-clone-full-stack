const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/auth');
const { protect } = require('../middlewares/auth');

router.post('/login', authControllers.login);
router.post('/signup', authControllers.signup);
router.post('/forgot-password', authControllers.forgotPassword);
router.post('/reset-password/:token', authControllers.resetPassword);
router.post('/update-details', protect, authControllers.updateDetails);
router.post('/update-visibility', protect, authControllers.updateVisibility);
router.post('/update-password', protect, authControllers.updatePassword);
router.post('/update-avatar', protect, authControllers.updateAvatar);
router.post('/request-delete', protect, authControllers.requestDelete);
router.delete('/delete-account', protect, authControllers.deleteAccount);
router.get('/logout', protect, authControllers.logout);

module.exports = router;
