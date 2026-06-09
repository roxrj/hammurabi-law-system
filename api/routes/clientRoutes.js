const express = require('express');
const multer = require('multer');
const {
  createClient,
  getMyClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// إعداد multer لرفع الصور
const fs = require('fs');
const path = require('path');

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/clients';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'client-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// جميع مسارات الموكلين تحتاج مصادقة
router.use(protect);

// مسارات CRUD
router.post('/', upload.single('photo'), createClient);
router.get('/', getMyClients);
router.get('/search', searchClients);
router.get('/:id', getClientById);
router.put('/:id', upload.single('photo'), updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
