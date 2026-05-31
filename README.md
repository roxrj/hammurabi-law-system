# ⚖️ نظام حمورابي - منصة إدارة المكاتب القانونية

<div dir="rtl">

## 🌟 نظرة عامة

نظام **حمورابي** هو منصة شاملة لإدارة المكاتب القانونية مبنية على:
- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (قم بإضافة رابطك)
- **AI**: OpenAI API (متكامل مع المتن القانوني العراقي)

---

## 🚀 خطوات التثبيت

### الخطوة 1: استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/hammurabi-law-system.git
cd hammurabi-law-system
```

### الخطوة 2: إعداد Backend

```bash
cd backend

# نسخ ملف الإعدادات
cp .env.example .env

# افتح ملف .env وأضف:
# MONGODB_URI=رابط MongoDB الخاص بك
# OPENAI_API_KEY=مفتاح OpenAI API الخاص بك

# تثبيت المكتبات
npm install

# إنشاء حساب الأدمن (لأول مرة فقط)
node setup-admin.js

# تشغيل السيرفر
npm run dev
```

### الخطوة 3: إعداد Frontend

```bash
cd frontend

# نسخ ملف الإعدادات
cp .env.example .env

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm start
```

---

## 🔧 إعداد قاعدة البيانات (MongoDB)

### خيار 1: MongoDB Atlas (مجاني وسهل - موصى به)
1. اذهب إلى [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساباً مجانياً
3. أنشئ Cluster جديد (اختر Free Tier)
4. اضغط "Connect" واختر "Connect your application"
5. انسخ رابط الاتصال وضعه في `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hammurabi
```

### خيار 2: MongoDB محلي
```bash
# تثبيت MongoDB
# ثم ضع في .env:
MONGODB_URI=mongodb://localhost:27017/hammurabi
```

---

## 🤖 إعداد الذكاء الاصطناعي (OpenAI)

1. اذهب إلى [platform.openai.com](https://platform.openai.com)
2. أنشئ حساباً وسجّل الدخول
3. اذهب إلى "API Keys" وأنشئ مفتاحاً جديداً
4. أضفه في `backend/.env`:
```
OPENAI_API_KEY=sk-...
```

---

## 🐳 تشغيل بـ Docker (اختياري)

```bash
# في مجلد المشروع الرئيسي
cp .env.example .env
# أضف ANTHROPIC_API_KEY في .env

docker-compose up -d
```

---

## 📱 الوصول للنظام

| الخدمة | الرابط |
|--------|--------|
| التطبيق | http://localhost:3000 |
| API | http://localhost:5000 |

### بيانات الدخول الافتراضية:
| | |
|------|------|
| **اسم المستخدم** | admin |
| **كلمة المرور** | admin123 |

> ⚠️ **مهم:** غيّر كلمة مرور الأدمن فور تثبيت النظام

---

## ✨ ميزات النظام

### لوحة الأدمن (نظام إدارة المحامين)
- ✅ إضافة محامين جدد (الاسم، اليوزر، الباسورد، معلومات المحامي).
- ✅ توليد روابط تسجيل دخول ذكية للمحامين (تحتوي على اسم المستخدم تلقائياً).
- ✅ واجهة إدارة شاملة: عرض اسم المحامي، اليوزر، ورابط الدخول مع ميزة النسخ السريع.
- ✅ التحكم الكامل: إمكانية تشغيل أو إطفاء النظام عن أي محامي بضغطة زر.

### إدارة الموكلين
- ✅ ملف شامل لكل موكل مع الصورة
- ✅ نظام مجلدات منظّم لكل موكل
- ✅ بحث متقدم في الموكلين

### نظام القضايا
- ✅ إنشاء وإدارة القضايا المتعددة لكل موكل داخل مجلده الخاص.
- ✅ تتبع جلسات المحكمة والوثائق.
- ✅ **زر "حسم":** ميزة إنهاء القضية بضغطة زر عند صدور الحكم.
- ✅ **تحليل AI ذكي:** تحليل القضايا بناءً على "المتن القانوني العراقي" لتقديم استشارات دقيقة.

### رفع الملفات
- ✅ صور، PDF، مستندات، تسجيلات صوتية
- ✅ تنظيم في أقسام منفصلة

### العقود الجاهزة
- ✅ عقد أتعاب، عقد زواج، عقد إيجار
- ✅ وكالة قانونية، عقد بيع، عقد عمل
- ✅ اتفاقية سرية، عقد شراكة

### المكتبة القانونية
- ✅ القانون المدني العراقي
- ✅ قانون الأحوال الشخصية
- ✅ قانون العقوبات
- ✅ قانون المرافعات
- ✅ قانون العمل

---

## 📁 هيكل المشروع

```
hammurabi-law-system/
├── backend/
│   ├── src/
│   │   ├── config/         # إعدادات قاعدة البيانات
│   │   ├── controllers/    # منطق التطبيق
│   │   ├── middleware/     # المصادقة والصلاحيات
│   │   ├── models/         # نماذج قاعدة البيانات
│   │   ├── routes/         # مسارات API
│   │   └── server.js       # نقطة البداية
│   ├── uploads/            # الملفات المرفوعة
│   ├── setup-admin.js      # إعداد الأدمن
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── services/       # API Services
│   │   └── styles/         # ملفات CSS
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🔒 الأمان

- JWT Authentication
- تشفير كلمات المرور بـ bcrypt
- صلاحيات متعددة المستويات (Admin / Lawyer)
- حماية جميع المسارات

---

## 📞 الدعم

للمساعدة والاستفسارات، يرجى فتح Issue في GitHub.

</div>
