const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'الرجاء إدخال اسم الموكل'],
    trim: true
  },
  idNumber: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الهاتف'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  photo: {
    type: String,
    default: null
  },
  nationality: {
    type: String,
    default: 'عراقي'
  },
  occupation: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['نشط', 'غير نشط', 'مكتمل'],
    default: 'نشط'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهرس للبحث السريع
clientSchema.index({ fullName: 'text', idNumber: 'text' });

module.exports = mongoose.model('Client', clientSchema);
