-- نظام حمورابي - مخطط قاعدة البيانات
-- Supabase PostgreSQL Schema

-- جدول المستخدمين (المحامين والإداريين)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'lawyer' CHECK (role IN ('admin', 'lawyer')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الموكلين
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  id_number VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  date_of_birth DATE,
  nationality VARCHAR(100),
  occupation VARCHAR(255),
  photo VARCHAR(500),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'نشط' CHECK (status IN ('نشط', 'مكتمل', 'معلق')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول القضايا
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_number VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  case_type VARCHAR(100),
  court VARCHAR(255),
  opposing_party VARCHAR(255),
  description TEXT,
  filing_date DATE,
  status VARCHAR(50) DEFAULT 'جارية' CHECK (status IN ('جارية', 'مغلقة', 'معلقة')),
  verdict TEXT,
  ai_analysis JSONB,
  sessions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول المستندات
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  category VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_clients_lawyer_id ON clients(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_lawyer_id ON documents(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);

-- إنشاء حساب إداري افتراضي (كلمة المرور: admin123 مشفرة)
-- استخدم bcrypt لتشفير كلمة المرور قبل الإدراج
INSERT INTO users (full_name, username, password, email, role, status)
VALUES (
  'مدير النظام',
  'admin',
  '$2a$10$YourHashedPasswordHere', -- استبدل بكلمة مرور مشفرة حقيقية
  'admin@hammurabi.local',
  'admin',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- تعليقات على الجداول
COMMENT ON TABLE users IS 'جدول المستخدمين - المحامين والإداريين';
COMMENT ON TABLE clients IS 'جدول الموكلين - بيانات العملاء';
COMMENT ON TABLE cases IS 'جدول القضايا - معلومات القضايا والدعاوى';
COMMENT ON TABLE documents IS 'جدول المستندات - الملفات والوثائق المرفوعة';
