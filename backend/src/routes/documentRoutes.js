const express = require('express');
const multer = require('multer');
const {
  uploadDocument,
  getClientDocuments,
  getCaseDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  searchDocuments,
  getStats
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// إعداد multer لرفع الملفات
const upload = multer({
  dest: './uploads/documents',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// جميع المسارات تحتاج مصادقة
router.use(protect);

// مسارات المستندات
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/client/:clientId', getClientDocuments);
router.get('/case/:caseId', getCaseDocuments);
router.get('/search', searchDocuments);
router.get('/stats', getStats);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
