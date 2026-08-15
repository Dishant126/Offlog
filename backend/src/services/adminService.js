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

export const adminCreateUser = async (userData) => {
  const { name, email, password, role = 'MENTOR', bio = '' } = userData;

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists with this email');

  const user = await User.create({
    name,
    email,
    password,
    role: ['USER', 'MENTOR', 'ADMIN'].includes(role) ? role : 'MENTOR',
    bio
  });

  return user;
};

export const adminAssignMentorToTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Set user role to MENTOR if not already
  if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
    user.role = 'MENTOR';
    await user.save();
  }

  // Check if member already exists
  let member = await TeamMember.findOne({ team: teamId, user: userId });
  if (member) {
    member.role = 'MENTOR';
    await member.save();
  } else {
    member = await TeamMember.create({
      team: teamId,
      user: userId,
      role: 'MENTOR'
    });
  }

  // Notify user
  await Notification.create({
    user: userId,
    title: 'Assigned as Mentor',
    message: `You have been assigned as a Mentor for team "${team.name}" by Admin.`,
    type: 'ROLE_CHANGED',
    relatedTeam: teamId
  });

  return member;
};

export const getMentorAssignments = async () => {
  const teams = await Team.find().populate('createdBy', 'name email');
  const assignments = await Promise.all(
    teams.map(async (team) => {
      const mentors = await TeamMember.find({ team: team._id, role: 'MENTOR' })
        .populate('user', 'name email avatar');
      return {
        team,
        mentors: mentors.map(m => m.user)
      };
    })
  );
  return assignments;
};

export const adminRemoveMentorFromTeam = async (teamId, userId) => {
  await TeamMember.deleteOne({ team: teamId, user: userId, role: 'MENTOR' });
  return true;
};

export const getStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalMentors = await User.countDocuments({ role: 'MENTOR' });
  const totalTeams = await Team.countDocuments();
  const totalMembers = await TeamMember.countDocuments();
  const totalJoinRequests = await JoinRequest.countDocuments({ status: 'PENDING' });
  const activeUsers = await User.countDocuments({ isActive: true });

  return {
    totalUsers,
    totalMentors,
    totalTeams,
    totalMembers,
    totalJoinRequests,
    activeUsers
  };
};


