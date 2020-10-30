const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, Authorization denied' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
      if (err) return res.status(401).json({ message: `${err.name}: ${err.message}` });
      req.user = verified.id;
      next();
      return true;
    });
  } catch (err) {
    res.status(500).json({ message: `${err.name}: ${err.message}` });
  }
  return true;
};

module.exports = auth;
