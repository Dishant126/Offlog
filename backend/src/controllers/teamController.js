import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';
import * as teamService from '../services/teamService.js';

export const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body, req.user._id);
    successResponse(res, team, 'Team created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const result = await teamService.getTeamById(teamId, req.user._id.toString(), req.user);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getUserTeams(req.user._id, req.user.role);
    successResponse(res, teams);
  } catch (error) {
    next(error);
  }
};

export const getPublicTeams = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await teamService.getPublicTeams(search, parseInt(page) || 1, parseInt(limit) || 20);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await teamService.updateTeam(teamId, req.body, req.user._id);
    successResponse(res, team, 'Team updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const isAdmin = req.user.role === 'ADMIN';
    await teamService.deleteTeam(teamId, req.user._id, isAdmin);
    successResponse(res, null, 'Team deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadTeamLogo = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);
    const logoUrl = `/uploads/team-logos/${req.file.filename}`;
    const { teamId } = req.params;
    const team = await teamService.updateTeam(teamId, { logo: logoUrl }, req.user._id);
    successResponse(res, { logo: logoUrl }, 'Team logo uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const regenerateCode = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await teamService.regenerateJoinCode(teamId, req.user._id);
    successResponse(res, { joinCode: team.joinCode }, 'Join code regenerated');
  } catch (error) {
    next(error);
  }
};

export const requestJoin = async (req, res, next) => {
  try {
    const { joinCode, message } = req.body;
    const result = await teamService.requestToJoin(joinCode, req.user._id, message);

    if (result.joined) {
      successResponse(res, result.membership, 'Joined team successfully', 201);
      return;
    }

    successResponse(res, result.request, 'Join request sent', 201);
  } catch (error) {
    next(error);
  }
};

export const joinPublicTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const membership = await teamService.joinPublicTeam(teamId, req.user._id);
    successResponse(res, membership, 'Joined team successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getJoinRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const requests = await teamService.getJoinRequests(teamId, req.user._id);
    successResponse(res, requests);
  } catch (error) {
    next(error);
  }
};

export const respondJoinRequest = async (req, res, next) => {
  try {
    const { teamId, requestId } = req.params;
    const { status } = req.body;
    const request = await teamService.respondToJoinRequest(requestId, teamId, req.user._id, status);
    successResponse(res, request, `Join request ${status.toLowerCase()}`);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
    await teamService.removeMember(teamId, memberId, req.user._id);
    successResponse(res, null, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const member = await teamService.updateMemberRole(teamId, memberId, role, req.user._id);
    successResponse(res, member, 'Member role updated');
  } catch (error) {
    next(error);
  }
};

export const transferLeadership = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { newLeaderId } = req.body;
    const isAdmin = req.user.role === 'ADMIN';
    await teamService.transferLeadership(teamId, newLeaderId, req.user._id, isAdmin);
    successResponse(res, null, 'Leadership transferred successfully');
  } catch (error) {
    next(error);
  }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const result = await teamService.leaveTeam(teamId, req.user._id);
    successResponse(res, result, result.teamDeleted ? 'Team deleted as you were the last member' : 'You left the team');
  } catch (error) {
    next(error);
  }
};

export const getTeamActivities = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const activities = await teamService.getTeamActivities(teamId, req.user);
    successResponse(res, activities);
  } catch (error) {
    next(error);
  }
};

export const cancelJoinRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    await teamService.cancelJoinRequest(requestId, req.user._id);
    successResponse(res, null, 'Join request cancelled');
  } catch (error) {
    next(error);
  }
};

