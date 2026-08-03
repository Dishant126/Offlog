import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  registerUser,
  loginUser,
  changePassword
} from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    const token = generateToken(user);
    setTokenCookie(res, token);

    await logActivity(user._id, 'USER_REGISTERED', 'USER', user._id, {}, req);

    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const token = generateToken(user);
    setTokenCookie(res, token);

    await logActivity(user._id, 'USER_LOGGED_IN', 'USER', user._id, {}, req);

    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      },
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    if (req.user) {
      await logActivity(req.user._id, 'USER_LOGGED_OUT', 'USER', req.user._id, {}, req);
    }
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    successResponse(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      tokenVersion: user.tokenVersion
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await changePassword(req.user._id, currentPassword, newPassword);
    const token = generateToken(user);
    setTokenCookie(res, token);

    await logActivity(user._id, 'PASSWORD_CHANGED', 'USER', user._id, {}, req);

    successResponse(res, { token }, 'Password changed successfully. All other sessions have been logged out.');
  } catch (error) {
    next(error);
  }
};
