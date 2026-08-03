import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import ActivityLog from '../models/ActivityLog.js';
import JoinRequest from '../models/JoinRequest.js';
import Notification from '../models/Notification.js';

export const getAllUsers = async (page = 1, limit = 20, search = '') => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return { users, total, page, pages: Math.ceil(total / limit) };
};

export const getAllTeams = async (page = 1, limit = 20, search = '') => {
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const teams = await Team.find(query)
    .populate('createdBy', 'name email avatar')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Team.countDocuments(query);

  return { teams, total, page, pages: Math.ceil(total / limit) };
};

export const adminDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Delete all memberships
  await TeamMember.deleteMany({ user: userId });
  // Delete all join requests
  await JoinRequest.deleteMany({ user: userId });
  // Delete all notifications
  await Notification.deleteMany({ user: userId });
  // Delete user
  await user.deleteOne();

  return true;
};

export const adminUpdateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const allowedUpdates = ['name', 'email', 'role', 'isActive', 'bio'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();
  return user;
};

export const getActivityLogs = async (page = 1, limit = 50, userId = null) => {
  const query = {};
  if (userId) query.user = userId;

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await ActivityLog.countDocuments(query);

  return { logs, total, page, pages: Math.ceil(total / limit) };
};

export const getStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalTeams = await Team.countDocuments();
  const totalMembers = await TeamMember.countDocuments();
  const totalJoinRequests = await JoinRequest.countDocuments({ status: 'PENDING' });
  const activeUsers = await User.countDocuments({ isActive: true });

  return {
    totalUsers,
    totalTeams,
    totalMembers,
    totalJoinRequests,
    activeUsers
  };
};
