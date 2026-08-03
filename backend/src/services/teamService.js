import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateUniqueJoinCode } from '../utils/helpers.js';

export const createTeam = async (teamData, userId) => {
  const { name, description, visibility } = teamData;
  const joinCode = await generateUniqueJoinCode(Team);

  const team = await Team.create({
    name,
    description: description || '',
    joinCode,
    visibility: visibility || 'PRIVATE',
    createdBy: userId
  });

  // Creator becomes TEAM_LEADER
  await TeamMember.create({
    user: userId,
    team: team._id,
    role: 'TEAM_LEADER'
  });

  return team;
};

export const getTeamById = async (teamId, userId) => {
  const team = await Team.findById(teamId)
    .populate('createdBy', 'name email avatar');

  if (!team) {
    throw new Error('Team not found');
  }

  // Get members with user details
  const members = await TeamMember.find({ team: teamId })
    .populate('user', 'name email avatar bio')
    .sort({ role: 1, joinedAt: 1 });

  // Get user's role in this team
  const userMembership = members.find(m => m.user._id.toString() === userId);
  const userRole = userMembership ? userMembership.role : null;

  return { team, members, userRole };
};

export const getUserTeams = async (userId) => {
  const memberships = await TeamMember.find({ user: userId })
    .populate({
      path: 'team',
      populate: { path: 'createdBy', select: 'name email avatar' }
    })
    .sort({ joinedAt: -1 });

  return memberships;
};

export const getPublicTeams = async (search = '', page = 1, limit = 20) => {
  const query = { visibility: 'PUBLIC' };
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

export const updateTeam = async (teamId, updateData, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  // Only leader or admin can update
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || membership.role !== 'TEAM_LEADER') {
    throw new Error('Only team leader can update team');
  }

  const allowedUpdates = ['name', 'description', 'visibility', 'allowJoinRequests'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      team[field] = updateData[field];
    }
  });

  await team.save();
  return team;
};

export const deleteTeam = async (teamId, userId, isAdmin = false) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  if (!isAdmin) {
    const membership = await TeamMember.findOne({ team: teamId, user: userId });
    if (!membership || membership.role !== 'TEAM_LEADER') {
      throw new Error('Only team leader or admin can delete team');
    }
  }

  // Delete all related data
  await TeamMember.deleteMany({ team: teamId });
  await JoinRequest.deleteMany({ team: teamId });
  await Notification.deleteMany({ relatedTeam: teamId });
  await team.deleteOne();

  return true;
};

export const regenerateJoinCode = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || membership.role !== 'TEAM_LEADER') {
    throw new Error('Only team leader can regenerate join code');
  }

  team.joinCode = await generateUniqueJoinCode(Team);
  await team.save();
  return team;
};

export const requestToJoin = async (joinCode, userId, message = '') => {
  const team = await Team.findOne({ joinCode });
  if (!team) throw new Error('Invalid join code');

  // Check if already a member
  const existingMember = await TeamMember.findOne({ team: team._id, user: userId });
  if (existingMember) {
    throw new Error('You are already a member of this team');
  }

  if (team.visibility === 'PUBLIC') {
    const membership = await TeamMember.create({
      user: userId,
      team: team._id,
      role: 'MEMBER'
    });

    const user = await User.findById(userId);
    const leader = await TeamMember.findOne({ team: team._id, role: 'TEAM_LEADER' });
    if (leader && user) {
      await Notification.create({
        user: leader.user,
        type: 'TEAM_JOINED',
        title: 'New Team Member',
        message: `${user.name} joined ${team.name}`,
        relatedTeam: team._id,
        relatedUser: userId
      });
    }

    return { joined: true, membership };
  }

  if (!team.allowJoinRequests) {
    throw new Error('This team is not accepting join requests');
  }

  // Check for existing pending request
  const existingRequest = await JoinRequest.findOne({
    team: team._id,
    user: userId,
    status: 'PENDING'
  });
  if (existingRequest) {
    throw new Error('You already have a pending request for this team');
  }

  const request = await JoinRequest.create({
    user: userId,
    team: team._id,
    message
  });

  // Notify team leader
  const leader = await TeamMember.findOne({ team: team._id, role: 'TEAM_LEADER' });
  if (leader) {
    const user = await User.findById(userId);
    await Notification.create({
      user: leader.user,
      type: 'JOIN_REQUEST',
      title: 'New Join Request',
      message: `${user.name} wants to join ${team.name}`,
      relatedTeam: team._id,
      relatedUser: userId
    });
  }

  return { joined: false, request };
};

export const joinPublicTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  if (team.visibility !== 'PUBLIC') {
    throw new Error('Join code is required for private teams');
  }

  const existingMember = await TeamMember.findOne({ team: team._id, user: userId });
  if (existingMember) {
    throw new Error('You are already a member of this team');
  }

  const membership = await TeamMember.create({
    user: userId,
    team: team._id,
    role: 'MEMBER'
  });

  const user = await User.findById(userId);
  const leader = await TeamMember.findOne({ team: team._id, role: 'TEAM_LEADER' });
  if (leader && user) {
    await Notification.create({
      user: leader.user,
      type: 'TEAM_JOINED',
      title: 'New Team Member',
      message: `${user.name} joined ${team.name}`,
      relatedTeam: team._id,
      relatedUser: userId
    });
  }

  return membership;
};

export const getJoinRequests = async (teamId, userId) => {
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || !['TEAM_LEADER', 'MENTOR'].includes(membership.role)) {
    throw new Error('Not authorized to view join requests');
  }

  const requests = await JoinRequest.find({ team: teamId, status: 'PENDING' })
    .populate('user', 'name email avatar bio')
    .sort({ createdAt: -1 });

  return requests;
};

export const respondToJoinRequest = async (requestId, teamId, userId, status) => {
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || membership.role !== 'TEAM_LEADER') {
    throw new Error('Only team leader can respond to join requests');
  }

  const request = await JoinRequest.findById(requestId);
  if (!request || request.team.toString() !== teamId) {
    throw new Error('Join request not found');
  }

  if (request.status !== 'PENDING') {
    throw new Error('This request has already been processed');
  }

  request.status = status;
  await request.save();

  const team = await Team.findById(teamId);
  const user = await User.findById(request.user);

  if (status === 'ACCEPTED') {
    // Add as member
    await TeamMember.create({
      user: request.user,
      team: teamId,
      role: 'MEMBER'
    });

    await Notification.create({
      user: request.user,
      type: 'JOIN_ACCEPTED',
      title: 'Join Request Accepted',
      message: `You have been accepted into ${team.name}`,
      relatedTeam: teamId
    });
  } else {
    await Notification.create({
      user: request.user,
      type: 'JOIN_REJECTED',
      title: 'Join Request Rejected',
      message: `Your request to join ${team.name} was rejected`,
      relatedTeam: teamId
    });
  }

  return request;
};

export const removeMember = async (teamId, memberId, userId) => {
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || !['TEAM_LEADER', 'MENTOR'].includes(membership.role)) {
    throw new Error('Not authorized to remove members');
  }

  const targetMember = await TeamMember.findOne({ team: teamId, user: memberId });
  if (!targetMember) throw new Error('Member not found');

  if (targetMember.role === 'TEAM_LEADER') {
    throw new Error('Cannot remove team leader');
  }

  if (membership.role === 'MENTOR' && targetMember.role === 'MENTOR') {
    throw new Error('Mentors cannot remove other mentors');
  }

  await targetMember.deleteOne();

  await Notification.create({
    user: memberId,
    type: 'REMOVED_FROM_TEAM',
    title: 'Removed from Team',
    message: `You have been removed from the team`,
    relatedTeam: teamId
  });

  return true;
};

export const updateMemberRole = async (teamId, memberId, newRole, userId) => {
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership || membership.role !== 'TEAM_LEADER') {
    throw new Error('Only team leader can change roles');
  }

  const targetMember = await TeamMember.findOne({ team: teamId, user: memberId });
  if (!targetMember) throw new Error('Member not found');

  if (targetMember.role === 'TEAM_LEADER') {
    throw new Error('Cannot change team leader role directly. Use transfer leadership.');
  }

  targetMember.role = newRole;
  await targetMember.save();

  await Notification.create({
    user: memberId,
    type: 'ROLE_CHANGED',
    title: 'Role Updated',
    message: `Your role has been updated to ${newRole}`,
    relatedTeam: teamId
  });

  return targetMember;
};

export const transferLeadership = async (teamId, newLeaderId, userId, isAdmin = false) => {
  if (!isAdmin) {
    const membership = await TeamMember.findOne({ team: teamId, user: userId });
    if (!membership || membership.role !== 'TEAM_LEADER') {
      throw new Error('Only team leader can transfer leadership');
    }
  }

  const newLeader = await TeamMember.findOne({ team: teamId, user: newLeaderId });
  if (!newLeader) throw new Error('User is not a member of this team');

  // Demote current leader to member
  await TeamMember.updateOne(
    { team: teamId, role: 'TEAM_LEADER' },
    { role: 'MEMBER' }
  );

  // Promote new leader
  newLeader.role = 'TEAM_LEADER';
  await newLeader.save();

  // Update team createdBy
  await Team.findByIdAndUpdate(teamId, { createdBy: newLeaderId });

  await Notification.create({
    user: newLeaderId,
    type: 'LEADERSHIP_TRANSFERRED',
    title: 'Leadership Transferred',
    message: 'You are now the team leader',
    relatedTeam: teamId
  });

  return newLeader;
};

export const leaveTeam = async (teamId, userId) => {
  const membership = await TeamMember.findOne({ team: teamId, user: userId });
  if (!membership) throw new Error('You are not a member of this team');

  if (membership.role === 'TEAM_LEADER') {
    // Check if there are other members
    const otherMembers = await TeamMember.find({
      team: teamId,
      user: { $ne: userId }
    });

    if (otherMembers.length > 0) {
      throw new Error('Transfer leadership before leaving the team');
    }
    // If no other members, delete the team
    await deleteTeam(teamId, userId, false);
    return { left: true, teamDeleted: true };
  }

  const team = await Team.findById(teamId).select('name');
  const leavingUser = await User.findById(userId).select('name');
  const leader = await TeamMember.findOne({ team: teamId, role: 'TEAM_LEADER' });

  await membership.deleteOne();

  if (leader && leader.user.toString() !== userId && team && leavingUser) {
    await Notification.create({
      user: leader.user,
      type: 'TEAM_LEFT',
      title: 'Member Left Team',
      message: `${leavingUser.name} left ${team.name}`,
      relatedTeam: teamId,
      relatedUser: userId
    });
  }

  return { left: true, teamDeleted: false };
};
