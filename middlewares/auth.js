const jwt = require('jsonwebtoken');

module.exports = function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error('No authorization header found, redirecting to login');
    return res.redirect('https://frontend.thenotemachine.com/signIn');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('No token found, redirecting to login');
    return res.redirect('https://frontend.thenotemachine.com/signIn');
  }

  // console.log('Token received:', token); // Log the token to inspect it

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed, redirecting to login:', err.message);
      return res.redirect('https://frontend.thenotemachine.com/signIn');
    }

    req.user = decoded;
    // console.log('User is authenticated:', req.user); // Log the authenticated user
    next();
  });
};
