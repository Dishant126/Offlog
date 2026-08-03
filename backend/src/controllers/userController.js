import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  searchUsers
} from '../services/userService.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);
    successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);
    await logActivity(req.user._id, 'PROFILE_UPDATED', 'USER', req.user._id, {}, req);
    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await updateUserProfile(req.user._id, { avatar: avatarUrl });
    successResponse(res, { avatar: avatarUrl }, 'Avatar uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await getUserDashboard(req.user._id);
    successResponse(res, dashboard);
  } catch (error) {
    next(error);
  }
};

export const searchUsersHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', 400);
    }
    const users = await searchUsers(q, req.user._id);
    successResponse(res, users);
  } catch (error) {
    next(error);
  }
};
