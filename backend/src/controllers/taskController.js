import { successResponse, errorResponse } from '../utils/response.js';
import * as taskService from '../services/taskService.js';
import { logActivity } from '../utils/logger.js';

export const createProjectHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const project = await taskService.createProject(teamId, req.body, req.user._id);
    await logActivity(req.user._id, 'PROJECT_CREATED', 'PROJECT', project._id, { name: project.name }, req);
    successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProjectsHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const projects = await taskService.getProjectsByTeam(teamId, req.user._id);
    successResponse(res, projects);
  } catch (error) {
    next(error);
  }
};

export const createTaskHandler = async (req, res, next) => {
  try {
    const { teamId, projectId } = req.params;
    const task = await taskService.createTask(teamId, projectId, req.body, req.user._id);
    await logActivity(req.user._id, 'TASK_CREATED', 'TASK', task._id, { title: task.title }, req);
    successResponse(res, task, 'Task assigned successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatusHandler = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, completionNotes, completionFile } = req.body;
    const result = await taskService.updateTaskStatus(taskId, status, req.user._id, completionNotes, completionFile);
    await logActivity(req.user._id, 'TASK_STATUS_UPDATED', 'TASK', taskId, { status }, req);
    successResponse(res, result, 'Task status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTaskHandler = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const result = await taskService.deleteTask(taskId, req.user._id);
    await logActivity(req.user._id, 'TASK_DELETED', 'TASK', taskId, {}, req);
    successResponse(res, result, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProjectHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await taskService.deleteProject(projectId, req.user._id);
    await logActivity(req.user._id, 'PROJECT_DELETED', 'PROJECT', projectId, {}, req);
    successResponse(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadTaskFileHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    successResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    }, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};
