import express from 'express';
import {
  createShortUrl,
  getMyUrls,
  deleteUrl,
  editUrl,
  togglePublicStats,
} from '../controllers/urlController.js';
import { bulkShortenUrls, upload } from '../controllers/bulkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/shorten', protect, createShortUrl);
router.post('/bulk', protect, upload.single('csvFile'), bulkShortenUrls);
router.get('/', protect, getMyUrls);
router.put('/:id', protect, editUrl);
router.delete('/:id', protect, deleteUrl);
router.put('/:id/public-toggle', protect, togglePublicStats);

export default router;
