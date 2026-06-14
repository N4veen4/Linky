import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  googleAuth,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getUserProfile);

export default router;
