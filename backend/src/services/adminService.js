import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import ActivityLog from '../models/ActivityLog.js';
import JoinRequest from '../models/JoinRequest.js';
import Notification from '../models/Notification.js';
import { isMentorAssignedToTeam } from '../utils/mentorAccess.js';

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
  const totalMentors = await User.countDocuments({ role: 'MENTOR' });

  return {
    totalUsers,
    totalTeams,
    totalMembers,
    totalJoinRequests,
    activeUsers,
    totalMentors
  };
};

export const getMentorManagementData = async () => {
  const mentors = await User.find({ role: 'MENTOR' }).select('-password').sort({ createdAt: -1 });
  const teams = await Team.find({}).populate('createdBy', 'name email avatar').sort({ createdAt: -1 });

  const teamMentorMap = await Promise.all(teams.map(async (team) => {
    const memberships = await TeamMember.find({ team: team._id, role: 'MENTOR' }).populate('user', 'name email avatar');
    return {
      team,
      mentors: memberships.map((membership) => membership.user)
    };
  }));

  return { mentors, teams: teamMentorMap };
};

export const addMentorToTeam = async (teamId, mentorId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== 'MENTOR') throw new Error('Mentor not found');

  const existingMembership = await TeamMember.findOne({ team: teamId, user: mentorId });
  if (existingMembership) {
    if (existingMembership.role === 'MENTOR') {
      return { added: false, message: 'Mentor already assigned to this team' };
    }
    existingMembership.role = 'MENTOR';
    await existingMembership.save();
    return { added: true, membership: existingMembership };
  }

  const membership = await TeamMember.create({ user: mentorId, team: teamId, role: 'MENTOR' });
  return { added: true, membership };
};

export const removeMentorFromTeam = async (teamId, mentorId) => {
  const membership = await TeamMember.findOne({ team: teamId, user: mentorId, role: 'MENTOR' });
  if (!membership) throw new Error('Mentor assignment not found');
  await membership.deleteOne();
  return true;
};

export const createMentorUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) throw new Error('User already exists with this email');

  const mentor = await User.create({
    ...userData,
    role: 'MENTOR'
  });

  return mentor;
};

export const getMentorsForTeam = async (teamId) => {
  const memberships = await TeamMember.find({ team: teamId, role: 'MENTOR' }).populate('user', 'name email avatar');
  return memberships.map((membership) => membership.user);
};

export const getTeamsForMentor = async (mentorId) => {
  const memberships = await TeamMember.find({ user: mentorId, role: 'MENTOR' }).populate({
    path: 'team',
    populate: { path: 'createdBy', select: 'name email avatar' }
  });
  return memberships.map((membership) => membership.team);
};
