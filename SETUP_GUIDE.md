# 🏛️ دليل إعداد نظام حمورابي

<div dir="rtl">

## ✅ المتطلبات الأساسية

- **Node.js** v14 أو أحدث
- **npm** أو **yarn**
- حساب **Supabase** (مجاني)
- مفتاح API من **Google Gemini** (اختياري للتحليل الذكي)

---

## 🚀 خطوات الإعداد

### 1️⃣ تثبيت التبعيات

```bash
npm install
```

### 2️⃣ إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم عدّل ملف `.env` وأضف المتغيرات التالية:

```env
# Backend
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=30d

# Google Gemini (اختياري)
GEMINI_API_KEY=your-gemini-key

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### 3️⃣ إعداد Supabase

#### أ) إنشاء مشروع جديد:

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساباً جديداً
3. انقر على "New Project"
4. أدخل اسم المشروع واختر منطقة جغرافية
5. انتظر إنشاء المشروع (قد يستغرق دقيقة)

#### ب) الحصول على مفاتيح API:

1. اذهب إلى **Settings** → **API**
2. انسخ **Project URL** إلى `SUPABASE_URL`
3. انسخ **Anon Key** إلى `SUPABASE_KEY`

#### ج) إنشاء الجداول:

1. اذهب إلى **SQL Editor** في لوحة التحكم
2. انقر على **New Query**
3. انسخ محتوى ملف `database/schema.sql`
4. الصق الكود وانقر **Run**

#### د) إنشاء حساب إداري:

في **SQL Editor**، قم بتشغيل هذا الكود لإنشاء حساب مدير:

```sql
INSERT INTO users (full_name, username, password, email, role, status)
VALUES (
  'مدير النظام',
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.Ug4b0oVQqPXkBWLqLqFwBVQDhMHzPe',
  'admin@hammurabi.local',
  'admin',
  'active'
);
```

**ملاحظة:** كلمة المرور أعلاه مشفرة (admin123). غيّرها لاحقاً من لوحة التحكم.

### 4️⃣ إعداد Google Gemini (اختياري)

للحصول على مفتاح Gemini API:

1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. انقر على **Create API Key**
3. انسخ المفتاح إلى `GEMINI_API_KEY` في ملف `.env`

---

## 🎯 تشغيل المشروع

### تشغيل الـ Frontend والـ Backend معاً:

```bash
npm run dev
```

سيفتح:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### تشغيل الـ Frontend فقط:

```bash
npm start
```

### تشغيل الـ Backend فقط:

```bash
npm run server
```

---

## 🔑 بيانات الدخول الافتراضية

عند تشغيل النظام لأول مرة:

| الحقل | القيمة |
|------|--------|
| **اسم المستخدم** | `admin` |
| **كلمة المرور** | `admin123` |

⚠️ **تنبيه:** غيّر كلمة المرور فوراً بعد الدخول!

---

## 📁 هيكل المشروع

```
hammurabi-law-system/
├── api/                    # Backend
│   ├── config/            # إعدادات قاعدة البيانات
│   ├── controllers/        # منطق الأعمال
│   ├── middleware/         # Middleware (المصادقة، إلخ)
│   ├── routes/            # المسارات
│   └── server.js          # نقطة دخول الخادم
├── src/                    # Frontend (React)
│   ├── pages/             # الصفحات
│   ├── components/        # المكونات
│   ├── services/          # خدمات API
│   ├── contexts/          # Context API
│   └── styles/            # الأنماط
├── database/              # ملفات قاعدة البيانات
├── public/                # الملفات الثابتة
├── .env                   # متغيرات البيئة
└── package.json           # التبعيات
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "SUPABASE_URL أو SUPABASE_KEY مفقود"

**الحل:** تأكد من إضافة المتغيرات في ملف `.env`

### الخطأ: "فشل الاتصال بقاعدة البيانات"

**الحل:** 
1. تحقق من صحة `SUPABASE_URL` و `SUPABASE_KEY`
2. تأكد من إنشاء الجداول في Supabase

### الخطأ: "لا تظهر الصور"

**الحل:** تأكد من:
1. وجود مجلد `uploads/clients` و `uploads/documents`
2. صحة مسارات الصور في قاعدة البيانات

---

## 📚 موارد إضافية

- [توثيق Supabase](https://supabase.com/docs)
- [توثيق React](https://react.dev)
- [توثيق Express.js](https://expressjs.com)
- [Google Gemini API](https://ai.google.dev)

---

## 📞 الدعم

إذا واجهت مشكلة، تأكد من:
1. تثبيت جميع التبعيات: `npm install`
2. إعداد متغيرات البيئة بشكل صحيح
3. إنشاء الجداول في Supabase
4. تشغيل الـ Backend والـ Frontend معاً

</div>
