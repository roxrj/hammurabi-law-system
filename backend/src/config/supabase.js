const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ تحذير: SUPABASE_URL أو SUPABASE_KEY مفقود في متغيرات البيئة.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ تم إعداد عميل Supabase بنجاح');

module.exports = supabase;
