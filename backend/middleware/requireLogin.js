   const jwt = require('jsonwebtoken');
   const config = require('../config');

   function requireLogin(req, res, next) {
     const header = req.headers.authorization;

     if (!header) {
       return res.status(401).json({ message: 'Please login first' });
     }

     const token = header.split(' ')[1];

     try {
       const decoded = jwt.verify(token, config.jwtSecret);
       req.user = decoded;
       next();
     } catch (err) {
       return res.status(401).json({ message: 'Token is invalid or expired' });
     }
   }

   module.exports = requireLogin;