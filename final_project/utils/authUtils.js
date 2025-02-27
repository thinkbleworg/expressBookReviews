const jwt = require('jsonwebtoken');

/**
 * Generate a token for the userId
 * @param {string} userId 
 * @returns jwt token string
 */

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
};

/**
 * Verify the existing token
 * @param {string} token 
 * @returns 
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };