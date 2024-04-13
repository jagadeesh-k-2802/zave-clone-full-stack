const { isAuthenticated } = require('../middlewares/auth');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res) => {
  // Adds req.user
  await isAuthenticated(req);
  const host = `${req.protocol}://${req.get('host')}`;
  res.status(404).render('pages/404', { user: req.user, host });
});
