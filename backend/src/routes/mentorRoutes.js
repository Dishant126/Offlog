import express from 'express';
import { protect, mentorOrAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { teamIdParamValidator } from '../validators/teamValidator.js';
import { getMentorDashboard, getMentorTeamOverview, createMentorTask, updateMentorTask, addMentorTaskComment, createMentorAnnouncement, uploadMentorFile } from '../controllers/mentorController.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect, mentorOrAdmin);

router.get('/dashboard', getMentorDashboard);
router.get('/teams/:teamId/overview', validate(teamIdParamValidator), getMentorTeamOverview);
router.post('/teams/:teamId/tasks', validate(teamIdParamValidator), createMentorTask);
router.put('/tasks/:taskId', updateMentorTask);
router.post('/tasks/:taskId/comments', addMentorTaskComment);
router.post('/teams/:teamId/announcements', validate(teamIdParamValidator), createMentorAnnouncement);
router.post('/teams/:teamId/files', validate(teamIdParamValidator), upload.single('file'), uploadMentorFile);

export default router;
