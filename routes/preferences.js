const express = require('express');
const router = express.Router();
const preferencesControllers = require('../controllers/preferences');
const { protect } = require('../middlewares/auth');

router.get('/get/:key', preferencesControllers.getPreferences);
router.post('/set', preferencesControllers.setPreferences);

module.exports = router;
