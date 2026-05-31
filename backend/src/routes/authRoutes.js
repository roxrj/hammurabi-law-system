const express = require('express');
const { login, getMe, createLawyer, getAllLawyers, toggleLawyerStatus } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// المسارات العامة
router.post('/login', login);
router.get('/me', protect, getMe);

// مسارات الأدمن فقط
router.post('/lawyers', protect, authorize('admin'), createLawyer);
router.get('/lawyers', protect, authorize('admin'), getAllLawyers);
router.put('/lawyers/:id/toggle', protect, authorize('admin'), toggleLawyerStatus);

module.exports = router;
