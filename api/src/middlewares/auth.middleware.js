import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  // PUBLIC ROUTES - No authentication required
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/health',
    '/health',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];

  // Check if current route is public
  if (publicRoutes.includes(req.path)) {
    console.log(`✅ PUBLIC ROUTE: ${req.method} ${req.path} - No auth required`);
    return next();
  }

  // For protected routes, check token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log(`❌ TOKEN MISSING: ${req.method} ${req.path} - Auth header: ${authHeader || 'undefined'}`);
    return res.status(401).json({
      message: 'Access denied. No token provided.',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`✅ TOKEN VERIFIED: User ${decoded.id || decoded.userId} accessing ${req.path}`);
    next();
  } catch (error) {
    console.log(`❌ INVALID TOKEN: ${req.path} - Error: ${error.message}`);
    return res.status(401).json({
      message: 'Invalid token.',
      error: error.message,
      path: req.path
    });
  }
};