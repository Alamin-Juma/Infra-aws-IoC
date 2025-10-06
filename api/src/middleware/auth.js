
import config from '../configs/app.config.js';
import jwt from 'jsonwebtoken';

const exemptPaths = [
  '/auth/login', 
  '/auth/refresh-access-token',
  '/forgot-password',
  '/requestTypes/verify',
  '/deviceTypes',
  '/externalRequest',
  '/health'
];

export const authenticateToken = (req, res, next) => {
  const isExempt = exemptPaths.some(path => req.path.startsWith(path))

  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  const jwtSecret = config.jwt_secret;

  if (isExempt) {
    if(accessToken) {
        return jwt.verify(accessToken, jwtSecret, (err, user) => {
          if (err) return res.status(401).json({ error: 'Unauthorized. Token is invalid or expired' });

          req.user = user;
          next();
        });
    } else {
      return next();
    }
  }

  if (!accessToken) return res.status(401).json({ error: 'Token missing' });

  return jwt.verify(accessToken, jwtSecret, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized. Token is invalid or expired' });

    req.user = user;
    next();
  });
}

export default { authenticateToken };