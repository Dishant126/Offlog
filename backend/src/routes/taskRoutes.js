import express from 'express';
import { protect } from '../middlewares/auth.js';
import { documentUpload } from '../middlewares/upload.js';
import {
  createProjectHandler,
  getProjectsHandler,
  createTaskHandler,
  updateTaskStatusHandler,
  deleteTaskHandler,
  deleteProjectHandler,
  uploadTaskFileHandler
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

router.post('/upload', documentUpload.single('file'), uploadTaskFileHandler);
router.post('/teams/:teamId/projects', createProjectHandler);
router.get('/teams/:teamId/projects', getProjectsHandler);
router.post('/teams/:teamId/projects/:projectId/tasks', createTaskHandler);
router.patch('/tasks/:taskId/status', updateTaskStatusHandler);
router.delete('/tasks/:taskId', deleteTaskHandler);
router.delete('/projects/:projectId', deleteProjectHandler);

export default router;
