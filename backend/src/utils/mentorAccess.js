import TeamMember from '../models/TeamMember.js';

export const isMentorAssignedToTeam = (team, mentorId) => {
  if (!team || !mentorId) return false;
  const mentorIds = team?.mentors || team?.mentorIds || [];
  const normalizedMentorId = mentorId.toString();
  return mentorIds.some((mentor) => mentor?.toString?.() === normalizedMentorId);
};

export const getAssignedTeamIdsForMentor = async (mentorUserId) => {
  const memberships = await TeamMember.find({ user: mentorUserId, role: 'MENTOR' }).select('team');
  return memberships.map((membership) => membership.team.toString());
};

export const ensureMentorTeamAccess = async (mentorUserId, teamId) => {
  const memberships = await TeamMember.find({ user: mentorUserId, role: 'MENTOR' }).select('team');
  const assignedTeamIds = memberships.map((membership) => membership.team.toString());
  if (!assignedTeamIds.includes(teamId.toString())) {
    throw new Error('You are not assigned to this team');
  }
};
