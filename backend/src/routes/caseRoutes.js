const express = require('express');
const {
  createCase,
  getClientCases,
  getCaseById,
  updateCase,
  addSession,
  analyzeCase,
  deleteCase
} = require('../controllers/caseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// جميع المسارات تحتاج مصادقة
router.use(protect);

// مسارات القضايا
router.post('/', createCase);
router.get('/client/:clientId', getClientCases);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.post('/:id/session', addSession);
router.post('/:id/analyze', analyzeCase);
router.delete('/:id', deleteCase);

module.exports = router;
