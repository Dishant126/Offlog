import express from 'express';
import { register, login, logout, getMe, changeUserPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerValidator, loginValidator, changePasswordValidator } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validate(changePasswordValidator), changeUserPassword);

export default router;
