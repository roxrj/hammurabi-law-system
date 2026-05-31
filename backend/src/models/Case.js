const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
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
  caseNumber: {
    type: String,
    required: [true, 'الرجاء إدخال رقم القضية'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'الرجاء إدخال عنوان القضية'],
    trim: true
  },
  caseType: {
    type: String,
    required: true,
    enum: ['مدنية', 'جزائية', 'تجارية', 'أحوال شخصية', 'عمالية', 'إدارية', 'أخرى']
  },
  court: {
    type: String,
    required: [true, 'الرجاء إدخال اسم المحكمة'],
    trim: true
  },
  opposingParty: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'الرجاء إدخال وصف القضية']
  },
  filingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['جارية', 'مؤجلة', 'محسومة', 'مغلقة'],
    default: 'جارية'
  },
  verdict: {
    type: String,
    trim: true
  },
  sessions: [{
    date: Date,
    notes: String,
    attendees: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    type: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  aiAnalysis: {
    summary: String,
    keyPoints: [String],
    recommendations: [String],
    analyzedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهرس للبحث
caseSchema.index({ caseNumber: 'text', title: 'text' });

module.exports = mongoose.model('Case', caseSchema);
