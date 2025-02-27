const { verifyToken } = require("../utils/authUtils");

const authenticate = (req, res, next) => {
  const token = req.session.user;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    console.log("token decoded", decoded.userId);
    req.user = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;