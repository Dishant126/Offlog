import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateUniqueJoinCode } from '../utils/helpers.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const setTokenCookie = (res, token) => {
  const isDev = process.env.NODE_ENV === 'development';
  res.cookie('token', token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? 'lax' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'strict',
    expires: new Date(0)
  });
};

import { normalizeSignupRole } from '../utils/roleUtils.js';

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists with this email');
  }

  const normalizedRole = normalizeSignupRole(role);
  const user = await User.create({ name, email, password, role: normalizedRole });
  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account has been deactivated');
  }

  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  user.tokenVersion += 1; // Increment to invalidate all existing sessions
  await user.save();

  return user;
};
