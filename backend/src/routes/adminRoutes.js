import express from 'express';
import { getUsers, getTeams, deleteUser, updateUser, deleteTeam, getActivityLogs, getStats, getMentorManagement, createMentor, assignMentorToTeam, removeMentorFromTeam, getMentorsForTeam } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/teams', getTeams);
router.get('/activity-logs', getActivityLogs);
router.get('/mentors', getMentorManagement);
router.post('/mentors', createMentor);
router.post('/mentors/assign', assignMentorToTeam);
router.delete('/mentors/:teamId/:mentorId', removeMentorFromTeam);
router.get('/mentors/:teamId', getMentorsForTeam);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.delete('/teams/:teamId', deleteTeam);

export default router;
