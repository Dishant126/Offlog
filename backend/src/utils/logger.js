import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, action, targetType, targetId = null, details = {}, req = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req?.ip || null
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};
