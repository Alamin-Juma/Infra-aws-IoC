import { match } from 'path-to-regexp';
import permissionsMap from './permissionsMap.js';

export function checkPermissions(req, res, next) {
  const userPermissions = req.user?.permissions || [];
  const requestPath = req.path;
  const requestMethod = req.method;

  let routeMatched = false;

  for (const [routePattern, methodPermissions] of Object.entries(permissionsMap)) {
    const matcher = match(routePattern, { decode: decodeURIComponent });

    if (matcher(requestPath)) {
      routeMatched = true;
      const requiredPermissions = methodPermissions[requestMethod];
      if (requiredPermissions && !requiredPermissions.every(p => userPermissions.includes(p))) {
        return res.status(403).json({
          path: requestPath,
          errorCode: 403,
          message: 'You are not authorized to access this resource! Contact the Administrator'
        });
      }

      break;
    }
  }

  if (!routeMatched) {
    return next();
  }

  next();
}
