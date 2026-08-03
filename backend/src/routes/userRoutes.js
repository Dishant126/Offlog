import express from 'express';
import { getProfile, updateProfile, uploadAvatar, getDashboard, searchUsersHandler } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileValidator } from '../validators/authValidator.js';
import { upload, setUploadType } from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileValidator), updateProfile);
router.post('/avatar', setUploadType('avatar'), upload.single('avatar'), uploadAvatar);
router.get('/dashboard', getDashboard);
router.get('/search', searchUsersHandler);

export default router;
