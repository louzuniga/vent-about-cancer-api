const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // check if there's no token
  if (!token) {
    return res.status(401).json({ msg: 'Not Autorized' });
  }

  // Verify Token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Access not valid' });
  }
};
