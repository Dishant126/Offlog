import User from '../models/User.js';
import TeamMember from '../models/TeamMember.js';
import JoinRequest from '../models/JoinRequest.js';
import Notification from '../models/Notification.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const allowedUpdates = ['name', 'bio', 'avatar'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();
  return user;
};

export const getUserDashboard = async (userId) => {
  const user = await User.findById(userId).select('-password');

  // Get teams with roles
  const memberships = await TeamMember.find({ user: userId })
    .populate({
      path: 'team',
      populate: { path: 'createdBy', select: 'name email avatar' }
    })
    .sort({ joinedAt: -1 });

  // Get pending join requests sent by user
  const pendingRequests = await JoinRequest.find({ user: userId, status: 'PENDING' })
    .populate('team', 'name description logo joinCode')
    .sort({ createdAt: -1 });

  // Get unread notifications only; read items are removed from the inbox
  const notifications = await Notification.find({ user: userId, read: false })
    .populate('relatedTeam', 'name')
    .populate('relatedUser', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  return {
    user,
    teams: memberships,
    pendingRequests,
    notifications,
    unreadCount
  };
};

export const searchUsers = async (query, currentUserId, limit = 20) => {
  const searchQuery = {
    _id: { $ne: currentUserId },
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  };

  const users = await User.find(searchQuery)
    .select('name email avatar bio role')
    .limit(limit)
    .sort({ name: 1 });

  return users;
};
