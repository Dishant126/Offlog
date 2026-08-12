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

export const getMentorManagement = async (req, res, next) => {
  try {
    const data = await adminService.getMentorManagementData();
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

export const createMentor = async (req, res, next) => {
  try {
    const mentor = await adminService.createMentorUser(req.body);
    successResponse(res, mentor, 'Mentor created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const assignMentorToTeam = async (req, res, next) => {
  try {
    const { teamId, mentorId } = req.body;
    const result = await adminService.addMentorToTeam(teamId, mentorId);
    successResponse(res, result, result.added ? 'Mentor assigned successfully' : 'Mentor already assigned');
  } catch (error) {
    next(error);
  }
};

export const removeMentorFromTeam = async (req, res, next) => {
  try {
    const { teamId, mentorId } = req.params;
    await adminService.removeMentorFromTeam(teamId, mentorId);
    successResponse(res, null, 'Mentor removed successfully');
  } catch (error) {
    next(error);
  }
};

export const getMentorsForTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const mentors = await adminService.getMentorsForTeam(teamId);
    successResponse(res, mentors);
  } catch (error) {
    next(error);
  }
};
