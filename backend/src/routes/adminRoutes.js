import express from 'express';
import { getUsers, getTeams, deleteUser, updateUser, deleteTeam, getActivityLogs, getStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/teams', getTeams);
router.get('/activity-logs', getActivityLogs);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.delete('/teams/:teamId', deleteTeam);

export default router;
