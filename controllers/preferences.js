/**
 * @route GET /preferences/get/:key
 * @desc Gets a cookie for given key
 */
exports.getPreferences = (req, res) => {
  const { key } = req.params;
  const value = req.cookies[key] || null;
  res.status(200).json({ success: true, value });
};

/**
 * @route POST /preferences/set
 * @desc Sets a cookie for given key, value pair
 */
exports.setPreferences = (req, res) => {
  const { key, value } = req.body;

  const options = {
    expires: new Date(Date.now() + 1e5 * 24 * 60 * 60 * 1000),
    httpOnly: false
  };

  res.status(200).cookie(key, value, options).json({ success: true });
};
