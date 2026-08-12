import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated', 401);
    }

    // Token version check for session invalidation
    if (decoded.tokenVersion !== user.tokenVersion) {
      return errorResponse(res, 'Session expired. Please log in again.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Not authorized', 401);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
  next();
};

export const mentorOrAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MENTOR') {
    return errorResponse(res, 'Access denied. Mentor or admin only.', 403);
  }
  next();
};
