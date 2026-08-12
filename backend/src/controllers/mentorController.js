import { successResponse } from '../utils/response.js';
import * as mentorService from '../services/mentorService.js';

export const getMentorDashboard = async (req, res, next) => {
  try {
    const dashboard = await mentorService.getMentorDashboard(req.user._id);
    successResponse(res, dashboard);
  } catch (error) {
    next(error);
  }
};

export const getMentorTeamOverview = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const overview = await mentorService.getMentorTeamOverview(req.user._id, teamId);
    successResponse(res, overview);
  } catch (error) {
    next(error);
  }
};

export const createMentorTask = async (req, res, next) => {
  try {
    const task = await mentorService.createMentorTask(req.user._id, req.params.teamId, req.body);
    successResponse(res, task, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMentorTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await mentorService.updateMentorTask(req.user._id, taskId, req.body);
    successResponse(res, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const addMentorTaskComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comment = await mentorService.addMentorTaskComment(req.user._id, taskId, req.body);
    successResponse(res, comment, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const createMentorAnnouncement = async (req, res, next) => {
  try {
    const announcement = await mentorService.createMentorAnnouncement(req.user._id, req.params.teamId, req.body);
    successResponse(res, announcement, 'Announcement created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const uploadMentorFile = async (req, res, next) => {
  try {
    if (!req.file) return successResponse(res, null, 'No file uploaded', 400);
    const file = await mentorService.uploadMentorFile(req.user._id, req.params.teamId, req.file);
    successResponse(res, file, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};
