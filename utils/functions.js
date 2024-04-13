const crypto = require('crypto');

/**
 *
 * @param {Number} length
 * @returns {String} A Random String with some bunch of characters
 */
exports.getRandomID = length => {
  return crypto.randomBytes(length / 2).toString('hex');
};

/**
 * Returns a random integer including both min and max
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} A Random number between {min} and {max}
 */
exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
