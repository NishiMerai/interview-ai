import User from '../models/User.js';
import { isDatabaseReady } from '../config/db.js';
import { getMemoryUserById } from '../services/devStore.service.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyAccessToken(token);

    if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
      const user = getMemoryUserById(decoded.sub);

      if (!user || user.isSuspended) {
        const error = new Error('Account unavailable');
        error.statusCode = 401;
        throw error;
      }

      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.sub).select('-passwordHash');

    if (!user || user.isSuspended) {
      const error = new Error('Account unavailable');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
}
