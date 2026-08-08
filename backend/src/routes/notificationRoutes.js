import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:notificationId/read', markAsRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:notificationId', deleteNotification);

export default router;

