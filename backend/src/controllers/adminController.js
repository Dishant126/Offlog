import { successResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';
import * as adminService from '../services/adminService.js';
import * as teamService from '../services/teamService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await adminService.getAllUsers(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search || ''
    );
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await adminService.getAllTeams(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search || ''
    );
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await adminService.adminDeleteUser(userId);
    await logActivity(req.user._id, 'ADMIN_DELETED_USER', 'USER', userId, {}, req);
    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.adminUpdateUser(userId, req.body);
    successResponse(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await adminService.adminCreateUser(req.body);
    await logActivity(req.user._id, 'ADMIN_CREATED_USER', 'USER', user._id, { role: user.role }, req);
    successResponse(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const assignMentorToTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;
    const member = await adminService.adminAssignMentorToTeam(teamId, userId);
    await logActivity(req.user._id, 'ADMIN_ASSIGNED_MENTOR', 'TEAM', teamId, { mentorId: userId }, req);
    successResponse(res, member, 'Mentor assigned to team successfully');
  } catch (error) {
    next(error);
  }
};

export const getMentorAssignments = async (req, res, next) => {
  try {
    const assignments = await adminService.getMentorAssignments();
    successResponse(res, assignments);
  } catch (error) {
    next(error);
  }
};

export const removeMentorFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    await adminService.adminRemoveMentorFromTeam(teamId, userId);
    await logActivity(req.user._id, 'ADMIN_REMOVED_MENTOR', 'TEAM', teamId, { mentorId: userId }, req);
    successResponse(res, null, 'Mentor removed from team');
  } catch (error) {
    next(error);
  }
};



export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    await teamService.deleteTeam(teamId, req.user._id, true);
    await logActivity(req.user._id, 'ADMIN_DELETED_TEAM', 'TEAM', teamId, {}, req);
    successResponse(res, null, 'Team deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, userId } = req.query;
    const result = await adminService.getActivityLogs(
      parseInt(page) || 1,
      parseInt(limit) || 50,
      userId || null
    );
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};
