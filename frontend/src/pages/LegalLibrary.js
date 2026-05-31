import React, { useState } from 'react';
import { Scale, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const legalData = [
  {
    id: 1,
    title: 'القانون المدني العراقي',
    law: 'القانون رقم 40 لسنة 1951',
    category: 'مدني',
    articles: [
      { number: 1, title: 'مصادر القانون', content: 'تسري النصوص التشريعية على جميع المسائل التي تتناولها هذه النصوص في لفظها أو في فحواها.' },
      { number: 6, title: 'عدم تأثير الجهل بالقانون', content: 'لا يعذر بجهل القانون وتسري نصوصه على الجميع من تاريخ نفاذها.' },
      { number: 185, title: 'تعريف العقد', content: 'العقد توافق إرادتين أو أكثر على إحداث أثر قانوني من إنشاء التزام أو نقله أو تعديله أو إنهائه.' },
      { number: 186, title: 'انعقاد العقد', content: 'ينعقد العقد بمجرد أن يتبادل طرفان التعبير عن إرادتين متطابقتين مع مراعاة ما يقرره القانون فوق ذلك من أوضاع معينة.' },
      { number: 341, title: 'نقل الملكية', content: 'نقل حق الملكية على العقارات لا يتم إلا بالتسجيل وفقاً لقانون التسجيل العقاري.' },
      { number: 430, title: 'المسؤولية التقصيرية', content: 'كل إضرار بالغير يلزم فاعله بضمان الضرر.' },
    ]
  },
  {
    id: 2,
    title: 'قانون الأحوال الشخصية',
    law: 'القانون رقم 188 لسنة 1959 وتعديلاته',
    category: 'أحوال شخصية',
    articles: [
      { number: 3, title: 'شروط صحة الزواج', content: 'يشترط لصحة عقد الزواج: أن يكون الزوجان أهلاً لإنشائه، وأن يكون الإيجاب والقبول صادرين في مجلس واحد.' },
      { number: 7, title: 'سن الزواج', content: 'لا يجوز إبرام عقد الزواج لمن كان دون الثامنة عشرة من العمر إلا بإذن القاضي.' },
      { number: 34, title: 'حقوق الزوجة', content: 'للزوجة المهر والنفقة والسكن اللائق، وتستحق النفقة من تاريخ عقد الزواج.' },
      { number: 39, title: 'الطلاق', content: 'الطلاق حل رابطة الزوجية بإرادة الزوج أو بالتراضي أو بحكم القضاء.' },
      { number: 57, title: 'حضانة الأطفال', content: 'الأم أحق بحضانة الولد في مرحلة الطفولة حتى إتمامه العاشرة وللبنت حتى إتمامها الخامسة عشرة.' },
      { number: 60, title: 'النفقة على الأولاد', content: 'نفقة الأولاد وتربيتهم على أبيهم ما لم يكن معسراً أو عاجزاً عن الكسب.' },
    ]
  },
  {
    id: 3,
    title: 'قانون العقوبات العراقي',
    law: 'القانون رقم 111 لسنة 1969',
    category: 'جزائي',
    articles: [
      { number: 1, title: 'مبدأ الشرعية', content: 'لا عقوبة على فعل أو امتناع إلا بنص قانوني، ولا توقع عقوبة إلا على الأفعال المحددة قانوناً.' },
      { number: 29, title: 'حالات المسؤولية', content: 'لا يُسأل جزائياً من ارتكب الجريمة وهو فاقد الوعي، أو مكره، أو في حالة دفاع شرعي.' },
      { number: 47, title: 'العقوبات الأصلية', content: 'العقوبات الأصلية: الإعدام، والسجن المؤبد، والسجن المؤقت، والحبس، والغرامة.' },
      { number: 128, title: 'الدفاع الشرعي', content: 'لكل شخص الحق في الدفاع عن نفسه وعرضه وماله وعن نفس وعرض ومال غيره.' },
      { number: 405, title: 'جريمة القتل العمد', content: 'يعاقب بالإعدام أو السجن المؤبد من قتل نفساً عمداً مع سبق الإصرار والترصد.' },
      { number: 421, title: 'جريمة الإيذاء الجسدي', content: 'يعاقب على إيقاع الأذى الجسدي بالآخرين بعقوبات متدرجة وفق جسامة الضرر.' },
    ]
  },
  {
    id: 4,
    title: 'قانون المرافعات المدنية',
    law: 'القانون رقم 83 لسنة 1969',
    category: 'إجراءات',
    articles: [
      { number: 1, title: 'نطاق التطبيق', content: 'تسري أحكام هذا القانون على جميع الدعاوى المدنية والتجارية والأحوال الشخصية.' },
      { number: 28, title: 'الاختصاص النوعي', content: 'تختص محكمة البداءة بالفصل في جميع الدعاوى المدنية والتجارية التي لا تختص بها محكمة أخرى.' },
      { number: 50, title: 'تقديم الدعوى', content: 'ترفع الدعوى إلى المحكمة بعريضة تقدم إليها من المدعي أو وكيله.' },
      { number: 168, title: 'الإثبات', content: 'على المدعي إثبات ادعائه وعلى المدعى عليه إثبات دفعه.' },
      { number: 216, title: 'الحكم', content: 'يصدر الحكم باسم الشعب ويجب أن يكون مسبباً.' },
      { number: 221, title: 'الطعن بالاستئناف', content: 'يجوز الطعن في الأحكام بطريق الاستئناف خلال مدة ثلاثين يوماً من تاريخ التبليغ.' },
    ]
  },
  {
    id: 5,
    title: 'قانون العمل العراقي',
    law: 'القانون رقم 37 لسنة 2015',
    category: 'عمالي',
    articles: [
      { number: 1, title: 'التعريفات', content: 'العامل: كل شخص طبيعي يعمل لدى صاحب عمل مقابل أجر. صاحب العمل: كل شخص طبيعي أو معنوي يستخدم عاملاً أو أكثر.' },
      { number: 3, title: 'حظر التمييز', content: 'يُحظر التمييز بين العمال في الأجور وظروف العمل على أساس الجنس أو الأصل أو الدين أو اللون.' },
      { number: 60, title: 'ساعات العمل', content: 'لا تزيد ساعات العمل الفعلية على ثماني ساعات يومياً أو ثمانٍ وأربعين ساعة أسبوعياً.' },
      { number: 70, title: 'الإجازة السنوية', content: 'يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن (20) يوماً في السنة.' },
      { number: 92, title: 'إنهاء عقد العمل', content: 'لا يجوز لصاحب العمل إنهاء عقد العمل إلا لأسباب مشروعة ومع إشعار مسبق.' },
      { number: 105, title: 'مكافأة نهاية الخدمة', content: 'يستحق العامل عند انتهاء خدمته مكافأة نهاية خدمة تحسب على أساس آخر أجر تقاضاه.' },
    ]
  },
];

const categories = ['الكل', 'مدني', 'أحوال شخصية', 'جزائي', 'إجراءات', 'عمالي'];

const LegalLibrary = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [expanded, setExpanded] = useState({});
  const [expandedArticles, setExpandedArticles] = useState({});

  const filtered = legalData.filter(law => {
    const matchSearch = law.title.includes(search) ||
      law.articles.some(a => a.title.includes(search) || a.content.includes(search));
    const matchCat = category === 'الكل' || law.category === category;
    return matchSearch && matchCat;
  });

  const toggleLaw = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleArticle = (key) => setExpandedArticles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Scale className="text-amber-400" size={32} />
          المكتبة القانونية العراقية
        </h1>
        <p className="text-gray-400 mt-1">القوانين والتشريعات العراقية المرجعية</p>
      </div>

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في القوانين والمواد..."
            className="input-field pr-12"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                category === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* القوانين */}
      <div className="space-y-4">
        {filtered.map((law) => (
          <div key={law.id} className="card">
            <button
              onClick={() => toggleLaw(law.id)}
              className="w-full flex items-center justify-between text-right"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-600 bg-opacity-20 rounded-xl p-3">
                  <BookOpen size={24} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{law.title}</h3>
                  <p className="text-gray-400 text-sm">{law.law}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-primary">{law.category}</span>
                <span className="text-gray-400 text-sm">{law.articles.length} مادة</span>
                {expanded[law.id] ? (
                  <ChevronUp className="text-amber-400" size={20} />
                ) : (
                  <ChevronDown className="text-amber-400" size={20} />
                )}
              </div>
            </button>

            {expanded[law.id] && (
              <div className="mt-6 space-y-3 border-t border-gray-700 pt-6">
                {law.articles.map((article) => {
                  const key = `${law.id}-${article.number}`;
                  const isVisible = search
                    ? article.title.includes(search) || article.content.includes(search)
                    : true;

                  if (!isVisible) return null;

                  return (
                    <div key={article.number} className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-amber-600 transition-all">
                      <button
                        onClick={() => toggleArticle(key)}
                        className="w-full flex items-center justify-between p-4 text-right"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            م {article.number}
                          </span>
                          <span className="text-white font-semibold">{article.title}</span>
                        </div>
                        {expandedArticles[key] ? (
                          <ChevronUp className="text-gray-400" size={16} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={16} />
                        )}
                      </button>
                      {expandedArticles[key] && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-200 leading-relaxed border-r-4 border-amber-600 pr-4">
                            {article.content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalLibrary;
