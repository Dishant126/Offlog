import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getMentorDashboardHandler } from '../controllers/mentorController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getMentorDashboardHandler);

export default router;
