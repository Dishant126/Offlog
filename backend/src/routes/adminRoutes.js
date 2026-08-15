import express from 'express';
import { getUsers, getTeams, deleteUser, updateUser, createUser, assignMentorToTeam, getMentorAssignments, removeMentorFromTeam, deleteTeam, getActivityLogs, getStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/teams', getTeams);
router.post('/teams/:teamId/mentor', assignMentorToTeam);
router.get('/mentor-assignments', getMentorAssignments);
router.delete('/teams/:teamId/mentor/:userId', removeMentorFromTeam);
router.get('/activity-logs', getActivityLogs);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.delete('/teams/:teamId', deleteTeam);



export default router;
