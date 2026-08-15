import { successResponse } from '../utils/response.js';
import { getMentorDashboardData } from '../services/mentorService.js';

export const getMentorDashboardHandler = async (req, res, next) => {
  try {
    const data = await getMentorDashboardData(req.user._id);
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};
