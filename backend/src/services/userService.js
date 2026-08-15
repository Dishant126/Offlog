import User from '../models/User.js';
import Team from '../models/Team.js';
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

  // Get teams with populated members & user details
  const memberships = await TeamMember.find({ user: userId })
    .populate({
      path: 'team',
      populate: [
        { path: 'createdBy', select: 'name email avatar' },
        { path: 'members', populate: { path: 'user', select: 'name email avatar' } }
      ]
    })
    .sort({ joinedAt: -1 });

  // Get pending join requests sent by user
  const pendingRequests = await JoinRequest.find({ user: userId, status: 'PENDING' })
    .populate('team', 'name description logo joinCode')
    .sort({ createdAt: -1 });

  // Get incoming join requests for teams where user is TEAM_LEADER or MENTOR
  const leaderOrMentorTeamIds = memberships
    .filter(m => ['TEAM_LEADER', 'MENTOR'].includes(m.role) && m.team)
    .map(m => m.team._id);

  const incomingRequests = await JoinRequest.find({
    team: { $in: leaderOrMentorTeamIds },
    status: 'PENDING'
  })
    .populate('team', 'name logo')
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });

  // Get recent notifications for activity feed
  const notifications = await Notification.find({ user: userId })
    .populate('relatedTeam', 'name')
    .populate('relatedUser', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(15);

  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  return {
    user,
    teams: memberships,
    pendingRequests,
    incomingRequests,
    notifications,
    unreadCount
  };
};

export const searchUsers = async (query, currentUserId, limit = 20) => {
  // Get current user's joined team IDs
  const userMemberships = await TeamMember.find({ user: currentUserId });
  const joinedTeamIds = userMemberships.map(m => m.team);

  // 1. Search Users / Team Members
  const userQuery = {
    _id: { $ne: currentUserId },
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  };

  const users = await User.find(userQuery)
    .select('name email avatar bio role')
    .limit(limit)
    .sort({ name: 1 });

  // 2. Search Joined Teams
  const joinedTeamsQuery = {
    _id: { $in: joinedTeamIds },
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { joinCode: { $regex: query, $options: 'i' } }
    ]
  };

  const joinedTeams = await Team.find(joinedTeamsQuery)
    .populate('members', '_id')
    .limit(limit)
    .sort({ name: 1 });

  // 3. Search Public Teams (excluding joined)
  const publicTeamsQuery = {
    _id: { $nin: joinedTeamIds },
    visibility: 'PUBLIC',
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { joinCode: { $regex: query, $options: 'i' } }
    ]
  };

  const publicTeams = await Team.find(publicTeamsQuery)
    .populate('members', '_id')
    .limit(limit)
    .sort({ name: 1 });

  const formatTeam = (t, isJoined) => ({
    _id: t._id,
    name: t.name,
    description: t.description,
    logo: t.logo,
    joinCode: t.joinCode,
    visibility: t.visibility,
    isJoined,
    memberCount: (t.members || []).length
  });

  return {
    users,
    joinedTeams: joinedTeams.map(t => formatTeam(t, true)),
    publicTeams: publicTeams.map(t => formatTeam(t, false)),
    teams: [
      ...joinedTeams.map(t => formatTeam(t, true)),
      ...publicTeams.map(t => formatTeam(t, false))
    ]
  };
};


