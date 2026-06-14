import express from 'express';
import {
  getStatsByShortCode,
  getPublicStatsByShortCode,
} from '../controllers/redirectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:shortCode', protect, getStatsByShortCode);
router.get('/public/:shortCode', getPublicStatsByShortCode);

export default router;
