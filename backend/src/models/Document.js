const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['عقد الأتعاب', 'القضايا', 'المستندات العامة', 'المراسلات', 'الأحكام والقرارات', 'أخرى']
  },
  title: {
    type: String,
    required: [true, 'الرجاء إدخال عنوان المستند'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهرس للبحث
documentSchema.index({ title: 'text' });

module.exports = mongoose.model('Document', documentSchema);
