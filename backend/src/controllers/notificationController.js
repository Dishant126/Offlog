import { successResponse, errorResponse } from '../utils/response.js';
import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id, read: false })
      .populate('relatedTeam', 'name')
      .populate('relatedUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    successResponse(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndDelete(
      { _id: notificationId, user: req.user._id },
    );
    if (!notification) return errorResponse(res, 'Notification not found', 404);
    successResponse(res, notification, 'Notification removed');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id, read: false });
    successResponse(res, null, 'All notifications removed');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndDelete({ _id: notificationId, user: req.user._id });
    successResponse(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
