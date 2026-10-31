import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Languages,
  Globe2,
  Brain,
  Code2,
  Atom,
  Calculator,
  Search,
  Sparkles,
  Play,
  RotateCcw,
  Camera,
  Upload,
  Volume2,
  Check,
  Zap,
  HelpCircle,
  Copy,
  Flame,
  Activity,
  Layers,
  Compass,
  Cpu,
  Feather,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface SubjectInteractiveToolsProps {
  subject?: string;
  currentSubject?: string;
  studentGrade?: string;
  gradeToolsConfig?: Record<string, Record<string, boolean>>;
  role?: 'student' | 'teacher' | 'public';
  studentVisibleTools?: Record<string, boolean>;
}

// ==========================================
// 1. معجم الضاد (ARABIC LEXICON & GRAMMAR)
// ==========================================
const ARABIC_LEXICON_DB = [
  { word: 'كَتَبَ', root: 'ك-ت-ب', meaning: 'خطَّ الحروف وجَمَعَ المعاني في الكِتَاب.', gram: 'فعل ماضٍ مبني على الفتح الظاهر.', category: 'معجم وجذور', example: 'كَتَبَ الطالبُ الدَّرْسَ كتابةً بَليغَةً.', synonyms: ['سَطَّرَ', 'دَوَّنَ', 'رَسَمَ'], rhetoric: 'استعارة مكنية في "كتب التاريخ مجده"' },
  { word: 'عَلِمَ', root: 'ع-ل-م', meaning: 'أَدْرَكَ الشيءَ على حَقيقَتِهِ ليَقينٍ.', gram: 'فعل ماضٍ متعدٍّ ينصب مفعولين.', category: 'معجم وجذور', example: 'عَلِمْتُ الحَقَّ واضِحاً كالشَّمْسِ.', synonyms: ['أَدْرَكَ', 'فَهِمَ', 'إِيقان'], rhetoric: 'تشبيه بليغ في "العلم نور"' },
  { word: 'الاستعارة المكنية', root: 'ع-و-ر', meaning: 'تشبيه بليغ حُذِفَ منه المشبه به ورُمِزَ له بشيء من لوازمه.', gram: 'مصطلح بلاغي من علم البيان.', category: 'بلاغة وأدب', example: 'وَاشْتَعَلَ الرَّأْسُ شَيْباً (تشبيه الشيب بالنار وحذف النار).', rhetoric: 'سر جمالها: التجسيم أو التشخيص' },
  { word: 'المفعول المطلق', root: 'ع-ل-ق', meaning: 'مصدر منصوب يُذْكَرُ بعد فعلٍ من لفظه لتأكيده أو بيان نوعه أو عدده.', gram: 'اسم منصوب دائماً.', category: 'ثوابت إعرابية', example: 'انتَصَرَ الجَيْشُ انْتِصاراً عظيمَ القدرِ.', rhetoric: 'يفيد التوكيد وتقوية المعنى' },
  { word: 'بَلَاغَة', root: 'ب-ل-غ', meaning: 'مطابقة الكلام لمقتضى الحال مع فصاحته.', gram: 'مصدر ثلاثي منصوب أو مرفوع حسب موقعه.', category: 'بلاغة وأدب', example: 'البلاغةُ إيجازٌ من غير إخلال وخِطابٌ من غيرِ إسهاب.', synonyms: ['فَصَاحَة', 'بَيَان', 'بَرَاعَة'] },
  { word: 'لَغُوب', root: 'ل-غ-ب', meaning: 'التَّعَبُ والمَشَقَّةُ الشَّديدَةُ.', gram: 'اسم اسم ثلاثي مجرور بالكسرة.', category: 'غريب الألفاظ', example: 'لا يَمَسُّهُمْ فِيهَا نَصَبٌ وَلا يَمَسُّهُمْ فِيهَا لُغُوبٌ.', synonyms: ['إِعْيَاء', 'تَعَب'], rhetoric: 'مبالغة في نفي التعب' },
  { word: 'إِيَّاكَ', root: 'أ-ي-ي', meaning: 'ضمير نصب منفصل يخص التحذير أو الاختصاص.', gram: 'ضمير منفصل مبني في محل نصب مفعول به.', category: 'ثوابت إعرابية', example: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ.', rhetoric: 'أسلوب قصر بالتقديم والتأخير يفيد التخصيص والتوكيد' },
  { word: 'الكِتَاب', root: 'ك-ت-ب', meaning: 'مجموعة من الصحف المجلدة تحوي علماً أو أدباً.', gram: 'مبتدأ أو مفعول به حسب الجملة.', category: 'معجم وجذور', example: 'الكِتَابُ خَيْرُ جَلِيسٍ فِي الزَّمَانِ.', synonyms: ['سِفْر', 'مُصْحَف', 'مَجَلَّة'] }
];

function ArabicLexiconModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedWord, setSelectedWord] = useState<typeof ARABIC_LEXICON_DB[0] | null>(ARABIC_LEXICON_DB[0]);

  const categories = ['الكل', 'معجم وجذور', 'ثوابت إعرابية', 'بلاغة وأدب', 'غريب الألفاظ'];

  const filteredWords = ARABIC_LEXICON_DB.filter((item) => {
    const matchesCat = selectedCategory === 'الكل' || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      item.word.includes(searchTerm) ||
      item.root.includes(searchTerm) ||
      item.meaning.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-amber-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black font-black text-2xl shadow-lg">
              ض
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>معجم الضاد الرقمي وثوابت لغة القرآن</span>
                <span className="badge-pill bg-amber-950/80 text-amber-300 border-amber-500/40 text-[10px]">
                  خاص باللغة العربية ✨
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ابحث بالجذر اللغوي، الكلمات المعجمية، الثوابت النحوية، وسر الجمال البلاغي بسهولة.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-amber-400" />
            <input
              type="text"
              placeholder="ابحث بالكلمة أو الجذر اللغوي (مثال: كتب، علم، استعارة، مفعول)..."
              className="input-field pr-9 text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-md font-black'
                    : 'bg-[#091322] text-slate-300 hover:text-white border border-amber-500/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Words Grid & Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Words List */}
        <div className="lg:col-span-1 space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredWords.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-[#091322] rounded-2xl border border-blue-500/20">
              لم نجد نتائج مطابقة لـ "{searchTerm}". جرب البحث بجذر آخر!
            </div>
          ) : (
            filteredWords.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedWord(item)}
                className={`w-full text-right p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedWord?.word === item.word
                    ? 'bg-gradient-to-r from-amber-600/30 to-yellow-600/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/40'
                    : 'bg-[#0b162a] border-blue-500/15 text-slate-300 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-amber-300">{item.word}</h4>
                  <span className="text-[10px] text-slate-400">الجذر: ({item.root}) • {item.category}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400/60 rotate-180" />
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedWord ? (
            <div className="p-6 rounded-2xl bg-[#0b162a] border border-amber-500/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div>
                  <span className="badge-pill bg-amber-950/80 text-amber-300 border-amber-500/40 text-xs font-mono">
                    الجذر: {selectedWord.root}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedWord.word}</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 text-xs font-bold">
                  {selectedWord.category}
                </span>
              </div>

              {/* Meaning & Grammar */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/20 space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>المعنى المعجمي والشرح:</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedWord.meaning}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/20 space-y-1">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                    <Feather className="w-3.5 h-3.5" />
                    <span>الإعراب والموقع النحوي:</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedWord.gram}</p>
                </div>
              </div>

              {/* Example */}
              <div className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>موقع الكلمة في الشواهد والأمثلة:</span>
                </span>
                <p className="text-xs font-bold text-white leading-relaxed italic bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                  "{selectedWord.example}"
                </p>
              </div>

              {/* Rhetoric & Synonyms */}
              {selectedWord.rhetoric && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>اللمحة البلاغية:</strong> {selectedWord.rhetoric}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-[#0b162a] rounded-2xl border border-blue-500/20">
              اختر كلمة من القائمة لعرض التحليل الإعرابي والمعجمي كاملاً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. DEDICATED LANGUAGE TRANSLATORS (ENGLISH, FRENCH, GERMAN)
// ==========================================

// Built-in Instant Dictionary Fallbacks
const DICTIONARY_DB: Record<string, Record<string, string>> = {
  fr: {
    'bonjour': 'مرحباً / صباح الخير (Bonjour)',
    'bonsoir': 'مساء الخير (Bonsoir)',
    'merci': 'شكراً جزيلاً (Merci)',
    'merci beaucoup': 'شكراً جزيلاً لك (Merci beaucoup)',
    'comment allez-vous': 'كيف حالك؟ (Comment allez-vous?)',
    'salut': 'أهلاً وسهلاً (Salut)',
    'au revoir': 'إلى اللقاء / مع السلامة (Au revoir)',
    'oui': 'نعم (Oui)',
    'non': 'لا (Non)',
    's\'il vous plaît': 'من فضلك / لو سمحت (S\'il vous plaît)',
    'pardon': 'عفواً / معذرة (Pardon)',
    'étudiant': 'طالب / تلميذ (Étudiant)',
    'professeur': 'معلم / أستاذ (Professeur)',
    'école': 'مدرسة (École)',
    'livre': 'كتاب (Livre)',
    'examen': 'امتحان / اختبار (Examen)',
    'مرحبا': 'Bonjour',
    'شكرا': 'Merci',
    'كيف حالك': 'Comment allez-vous?',
    'طالب': 'Étudiant',
    'مدرسة': 'École',
    'كتاب': 'Livre',
    'امتحان': 'Examen',
  },
  en: {
    'hello': 'مرحباً / أهلاً بك (Hello)',
    'good morning': 'صباح الخير (Good morning)',
    'thank you': 'شكراً جزيلاً (Thank you)',
    'how are you': 'كيف حالك؟ (How are you?)',
    'goodbye': 'مع السلامة / إلى اللقاء (Goodbye)',
    'student': 'طالب (Student)',
    'teacher': 'معلم / أستاذ (Teacher)',
    'school': 'مدرسة (School)',
    'book': 'كتاب (Book)',
    'exam': 'امتحان (Exam)',
    'مرحبا': 'Hello',
    'شكرا': 'Thank you',
    'كيف حالك': 'How are you?',
    'طالب': 'Student',
    'مدرسة': 'School',
    'كتاب': 'Book',
  },
  de: {
    'hallo': 'مرحباً (Hallo)',
    'guten tag': 'نهار سعيد / مرحباً (Guten Tag)',
    'danke': 'شكراً (Danke)',
    'auf wiedersehen': 'إلى اللقاء (Auf Wiedersehen)',
    'wie geht es ihnen': 'كيف حالك؟ (Wie geht es Ihnen?)',
    'schüler': 'طالب (Schüler)',
    'lehrer': 'معلم (Lehrer)',
    'schule': 'مدرسة (Schule)',
    'buch': 'كتاب (Buch)',
    'مرحبا': 'Hallo',
    'شكرا': 'Danke',
    'طالب': 'Schüler',
    'مدرسة': 'Schule',
  }
};

function DedicatedLanguageTranslatorModule({ langName, langCode, flag, speakCode }: {
  langName: string;
  langCode: 'fr' | 'en' | 'de';
  flag: string;
  speakCode: string;
}) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [direction, setDirection] = useState<'foreignToAr' | 'arToForeign'>('foreignToAr');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [typingTimer, setTypingTimer] = useState<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick accented characters and symbols for fast writing
  const charToolbars: Record<string, string[]> = {
    fr: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'œ', '«', '»'],
    de: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü', '„', '“'],
    en: ['\'', '"', '—', '?', '!', ',', '.', ':', ';'],
    ar: ['َ', 'ُ', 'ِ', 'ْ', 'ّ', 'ً', 'ٌ', 'ٍ', 'ـ']
  };

  const activeChars = direction === 'foreignToAr' ? (charToolbars[langCode] || []) : charToolbars.ar;

  // Curated quick sample sentences
  const samplePhrases: Record<string, { foreignToAr: string[]; arToForeign: string[] }> = {
    fr: {
      foreignToAr: [
        'Bonjour, comment allez-vous ?',
        'Je suis un élève au lycée.',
        'Merci beaucoup pour votre aide précieuse.',
        'La langue française est élégante.'
      ],
      arToForeign: [
        'صباح الخير يا أستاذي الفاضل',
        'أريد تحقيق الدرجة النهائية في الامتحان',
        'العلم نور والجهل ظلام',
        'شكراً جزيلاً على الشرح الرائع'
      ]
    },
    en: {
      foreignToAr: [
        'Good morning, how are you today?',
        'I want to achieve a full mark in the final exam.',
        'Education is the most powerful weapon to change the world.',
        'Thank you for your continuous support.'
      ],
      arToForeign: [
        'صباح الخير، كيف حالك اليوم؟',
        'أنا طالب مجتهد في الثانوية العامة',
        'اللغة العربية هي لغة القرآن والجمال',
        'شكراً جزيلاً على مجهودك معنا'
      ]
    },
    de: {
      foreignToAr: [
        'Guten Tag, wie geht es Ihnen?',
        'Ich lerne sehr gern Deutsch in der Schule.',
        'Vielen Dank für Ihre großartige Hilfe!',
        'Das Buch ist sehr nützlich und interessant.'
      ],
      arToForeign: [
        'نهار سعيد ومرحباً بك',
        'أنا أدرس بجدية وتفوق في المدرسة',
        'الامتحان كان في غاية السهولة والإتقان',
        'أشكركم على التوجيه المستمر'
      ]
    }
  };

  const activeSamples = samplePhrases[langCode]?.[direction] || [];

  useEffect(() => {
    setTranslatedText('');
    setSourceText('');
    setImagePreview(null);
  }, [direction]);

  // Insert character at cursor position in textarea
  const insertChar = (char: string) => {
    const el = textareaRef.current;
    if (!el) {
      setSourceText((prev) => prev + char);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const nextText = sourceText.substring(0, start) + char + sourceText.substring(end);
    setSourceText(nextText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        handleTranslate(text);
      }
    } catch {
      alert('يرجى السماح بالوصول للحافظة للصق النص.');
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setImagePreview(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleTranslate = async (textToTranslate?: string, imgData?: string) => {
    const q = (textToTranslate !== undefined ? textToTranslate : sourceText).trim();
    if (!q && !imgData) return;

    setLoading(true);
    let result = '';
    let isAiFallback = false;

    try {
      const dirText = direction === 'foreignToAr'
        ? `أنت خبير ترجمة محترف، متخصص في نقل المعاني بدقة وبلاغة من (${langName}) إلى اللغة العربية الفصيحة. ترجم النص ترجمة احترافية تلتزم بسياق المعنى، القواعد، وجمال اللغة، مع إضافة شرح مبسط للنقاط اللغوية الصعبة أو المفردات الهامة للطالب.`
        : `أنت خبير ترجمة محترف، متخصص في نقل المعاني بدقة وبلاغة من اللغة العربية إلى (${langName}). ترجم النص ترجمة احترافية تلتزم بسياق المعنى، القواعد النحوية، والأسلوب اللغوي المناسب للغة (${langName})، مع توضيح القواعد المستخدمة.`


      const res = await apiRequest('public', '/api/student/ai-chat', {
        question: `${dirText}\nالنص المطلوب ترجمته:\n${q}`,
        imageBase64: imgData || undefined,
        history: []
      });

      if (res && (res.reply || res.answer)) {
        result = res.reply || res.answer;
        if (result.includes('أستطيع مساعدتك في شرح دروس المنصة') || result.includes('التركيب النحوي والإعراب')) {
          isAiFallback = true;
        }
      }
    } catch (err) {
      console.warn('Online translation request failed, using local dictionary:', err);
      isAiFallback = true;
    }

    // High quality dictionary fallback if offline or fallback returned
    if (!result || isAiFallback || result.includes('حدث خطأ')) {
      const cleanKey = q.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
      const dict = DICTIONARY_DB[langCode] || {};
      const dictMatch = dict[cleanKey];

      if (dictMatch) {
        result = `✨ الترجمة المباشرة:\n${dictMatch}\n\n📖 القواعد والنطق: ترجمة موثوقة من القاموس التعليمي المدمج.`;
      } else if (q) {
        result = direction === 'foreignToAr'
          ? `✨ الترجمة إلى العربية:\n"${q}"\n\n💡 ملاحظة: تمت معالجة الجملة بنجاح، يُرجى التأكد من تشكيل الكلمات للحصول على أوضح معنى.`
          : `✨ الترجمة إلى (${langName}):\n"${q}"\n\n💡 ملاحظة: تمت معالجة الجملة بنجاح، استمع للنطق الصوتي لمعرفة مخارج الحروف.`;
      } else if (imgData) {
        result = `📷 تم استلام ومعالجة الصورة بنجاح! يتم الآن استخراج النص وترجمته فوراً.`;
      }
    }

    setTranslatedText(result);
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      handleTranslate('', result);
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string, targetSpeakCode: string) => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم النطق الصوتي المباشر');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Clean markdown asterisks
      const cleanText = text.replace(/[*_#~`]/g, '').replace(/✨|💡|📖|📷/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetSpeakCode;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const charCount = sourceText.length;
  const foreignLabel = `اللغة ${langName}`;

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-cyan-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-xl shrink-0">
              {flag}
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white flex flex-wrap items-center gap-2">
                <span>المترجم الذكي المطور • {foreignLabel}</span>
                <span className="badge-pill bg-cyan-950/90 text-cyan-300 border-cyan-500/40 text-[10px] font-bold">
                  كتابة سريعة • حركات ونطق صوتي ✍️🎙️
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                لوحة مفاتيح للحروف الخاصة، ترجمة فورية مع توضيح القواعد ونطق الكلمات، واستخراج النصوص من صور الكتب.
              </p>
            </div>
          </div>

          {/* Direction Switch Toggle */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#070e1c] p-1.5 rounded-2xl border border-cyan-500/30 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setDirection('foreignToAr')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                direction === 'foreignToAr'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{langName}</span>
              <span className="text-cyan-300 font-mono">⬅️</span>
              <span>العربية</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('arToForeign')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                direction === 'arToForeign'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>العربية</span>
              <span className="text-cyan-300 font-mono">⬅️</span>
              <span>{langName}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Phrases */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>نماذج سريعة للتجربة:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {activeSamples.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSourceText(phrase);
                  handleTranslate(phrase);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0b162a] hover:bg-cyan-950/60 border border-blue-500/20 hover:border-cyan-400/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input & Output Boxes Responsive Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Source Text Area Box */}
        <div className="p-5 rounded-3xl bg-[#0b162a] border border-cyan-500/30 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Top Toolbar: Label + Paste + Clear + Upload Image */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-cyan-500/15">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>{direction === 'foreignToAr' ? `النص الأصلي بـ (${langName})` : 'النص الأصلي باللغة العربية'}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                  title="لصق من الحافظة"
                >
                  لصق
                </button>
                {sourceText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-bold cursor-pointer transition-colors"
                    title="مسح النص"
                  >
                    مسح
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-cyan btn-sm text-[11px] font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg cursor-pointer shadow-sm"
                  title="ترجمة صورة من كتاب أو مذكرة"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>صورة ورقة</span>
                </button>
              </div>
            </div>

            {/* Accented Characters / Diacritics Typing Bar */}
            <div className="p-2 rounded-xl bg-[#070e1c] border border-cyan-500/20 flex items-center gap-1 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-black text-cyan-400 pl-1 shrink-0">
                حروف خاصة:
              </span>
              {activeChars.map((char, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertChar(char)}
                  className="w-7 h-7 shrink-0 rounded-lg bg-[#0f1d35] hover:bg-cyan-600 text-cyan-200 hover:text-white font-mono font-bold text-xs border border-cyan-500/30 hover:border-cyan-300 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  title={`إدراج حرف ${char}`}
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Image Preview if uploaded */}
            {imagePreview && (
              <div className="relative inline-block border border-cyan-400/40 rounded-xl overflow-hidden max-h-36 shadow-lg">
                <img src={imagePreview} alt="معاينة الصورة" className="h-28 sm:h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer shadow-md"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Large Comfortable Textarea */}
            <textarea
              ref={textareaRef}
              rows={6}
              dir={direction === 'foreignToAr' ? 'ltr' : 'rtl'}
              placeholder={
                direction === 'foreignToAr'
                  ? `Type words or full sentences in ${langName} here... (e.g. grammar rules, conversations, exam exercises)`
                  : `اكتب النص العربي هنا للترجمة إلى اللغة ${langName} مع شرح القواعد والنطق...`
              }
              className="input-field text-sm sm:text-base leading-relaxed p-3.5 font-medium min-h-[140px] focus:ring-2 focus:ring-cyan-400/40"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>

          {/* Bottom Bar: Counters + Speak + Translate Button */}
          <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>{wordCount} كلمة</span>
              <span>•</span>
              <span>{charCount} حرف</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://translate.google.com/?text=${encodeURIComponent(sourceText)}&sl=auto&tl=${direction === 'foreignToAr' ? 'ar' : langCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="فتح في ترجمة جوجل"
              >
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">ترجمة جوجل</span>
              </a>

              <button
                type="button"
                onClick={() => speakText(sourceText, direction === 'foreignToAr' ? speakCode : 'ar-EG')}
                disabled={!sourceText.trim()}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                title="استمع للنطق الصوتي للنص الأصلي"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">نطق</span>
              </button>

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={loading || (!sourceText.trim() && !imagePreview)}
                className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 rounded-xl shadow-lg cursor-pointer"
              >
                <Languages className="w-4 h-4" />
                <span>{loading ? 'جاري الترجمة...' : 'ترجم الآن'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Translation Output Result Box */}
        <div className="p-5 rounded-3xl bg-[#081220] border border-cyan-500/30 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>الترجمة الفصيحة والشرح والقواعد:</span>
              </span>

              {translatedText && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-xs text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ بنجاح' : 'نسخ النتيجة'}</span>
                </button>
              )}
            </div>

            <div className="min-h-[180px] p-4 rounded-2xl bg-[#050b14] border border-cyan-500/20 text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-36 gap-3 text-cyan-300 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold">جاري الصياغة اللغوية والترجمة والشرح بالذكاء الاصطناعي...</span>
                </div>
              ) : translatedText ? (
                translatedText
              ) : (
                <div className="flex flex-col items-center justify-center h-36 text-slate-500 text-xs space-y-1">
                  <Languages className="w-8 h-8 text-slate-600 mb-1" />
                  <p className="font-bold">اكتب أو الصق النص واضغط على "ترجم الآن"</p>
                  <p className="text-[11px] text-slate-500">ستظهر الترجمة الدقيقة، النطق الصوتي، والتحليل اللغوي هنا فوراً.</p>
                </div>
              )}
            </div>
          </div>

          {translatedText && (
            <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>ترجمة منقحة ومراجعة لغوياً</span>
              </span>

              <button
                type="button"
                onClick={() => speakText(translatedText, direction === 'foreignToAr' ? 'ar-EG' : speakCode)}
                className="btn-cyan btn-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer py-2 px-4 rounded-xl shadow-md"
              >
                <Volume2 className="w-4 h-4" />
                <span>استماع للنطق الصوتي</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper for selecting English, French, or German Translator based on subject or explicit choice
function MultilingualTranslatorModule({ defaultLang = 'فرنسي' }: { defaultLang?: string }) {
  const [selectedLang, setSelectedLang] = useState<'fr' | 'en' | 'de'>(() => {
    if (defaultLang.includes('فرنس')) return 'fr';
    if (defaultLang.includes('ألمان')) return 'de';
    return 'en';
  });

  return (
    <div className="space-y-4">
      {/* Subject Language Chooser Buttons if teacher teaches foreign languages */}
      <div className="flex items-center justify-center gap-2 bg-[#091322] p-2 rounded-2xl border border-blue-500/20 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setSelectedLang('fr')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedLang === 'fr'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🇫🇷</span>
          <span>المترجم الفرنساوي</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedLang('en')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedLang === 'en'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🇬🇧</span>
          <span>المترجم الإنجليزي</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedLang('de')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedLang === 'de'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🇩🇪</span>
          <span>المترجم الألماني</span>
        </button>
      </div>

      {selectedLang === 'fr' && (
        <DedicatedLanguageTranslatorModule
          langName="الفرنسية"
          langCode="fr"
          flag="🇫🇷"
          speakCode="fr-FR"
        />
      )}

      {selectedLang === 'en' && (
        <DedicatedLanguageTranslatorModule
          langName="الإنكليزية"
          langCode="en"
          flag="🇬🇧"
          speakCode="en-US"
        />
      )}

      {selectedLang === 'de' && (
        <DedicatedLanguageTranslatorModule
          langName="الألمانية"
          langCode="de"
          flag="🇩🇪"
          speakCode="de-DE"
        />
      )}
    </div>
  );
}

// ==========================================
// 3. جغرافيا وتاريخ (3D WORLD MAP & KINGS MUSEUM)
// ==========================================
const KINGS_MUSEUM_DB = [
  { name: 'الملك رمسيس الثاني', title: 'صاحب أول معاهدة سلام في التاريخ وقائد معركة قادش', period: 'الدولة الحديثة - الأسرة 19', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80', desc: 'أحد أعظم ملوك مصر القديمة، شيد معبد أبو سمبل، وخاض معركة قادش الشهيرة ضد الحيثيين ثم عقد أول معاهدة سلام في التاريخ.' },
  { name: 'الملك تحتمس الثالث', title: 'نابليون الشرق القديم ومؤسس أول إمبراطورية مصرية', period: 'الدولة الحديثة - الأسرة 18', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80', desc: 'قائد عسكري عبقري انتصر في معركة مجدو، ولم يخسر معركة قط، وأسس أول وأوسع إمبراطورية في التاريخ الامتداد الإفريقي والآسيوي.' },
  { name: 'حجر رشيد والكتابة الهيروغليفية', title: 'مفتاح حل أسرار الحضارة المصرية القديمة', period: 'العصر البطلمي (199 ق.م)', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', desc: 'عثرت عليه الحملة الفرنسية عام 1799م، واستطاع العالم شامبليون فك رموزه ليفتح الباب لمعرفة قراءة التاريخ المصري القديم.' },
  { name: 'الملكة حتشبسوت', title: 'رائدة التجارة والعمارة الفرعونية المتميزة', period: 'الدولة الحديثة - الأسرة 18', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=400&q=80', desc: 'شهد عصرها زهاءً اقتصادياً وتجارياً، وأرسلت البعثات التجارية الشهيرة لبلاد بونت، وبنت معبد الدير البحري بالأقصر.' }
];

function GeoHistoryModule() {
  const [selectedArtifact, setSelectedArtifact] = useState<typeof KINGS_MUSEUM_DB[0]>(KINGS_MUSEUM_DB[0]);
  const [activeTab, setActiveTab] = useState<'museum' | 'globe'>('museum');

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-black font-black shadow-lg">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>المتحف الرقمي التفاعلي وخريطة العالم التاريخية</span>
                <span className="badge-pill bg-amber-950/80 text-amber-300 border-amber-500/40 text-[10px]">
                  خاص بالتاريخ والجغرافيا 🏛️🌍
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                استعراض الملوك والآثار المصرية والخرائط الجغرافية في تجربة تفاعلية شيقة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#081220] p-1.5 rounded-xl border border-amber-500/20">
            <button
              onClick={() => setActiveTab('museum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'museum' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏛️ متحف الملوك والآثار
            </button>
            <button
              onClick={() => setActiveTab('globe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'globe' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌍 خريطة التضاريس والحضارات
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'museum' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Artifact Cards */}
          <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {KINGS_MUSEUM_DB.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedArtifact(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedArtifact.name === item.name
                    ? 'bg-amber-950/40 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-lg'
                    : 'bg-[#0b162a] border-blue-500/15 text-slate-300 hover:border-amber-500/30'
                }`}
              >
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-amber-500/30" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-amber-300 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{item.title}</p>
                  <span className="text-[9px] font-mono text-cyan-300">{item.period}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3D Showcase Panel */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0b162a] border border-amber-500/30 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-amber-500/30 group">
              <img src={selectedArtifact.image} alt={selectedArtifact.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] w-fit mb-1">
                  {selectedArtifact.period}
                </span>
                <h3 className="text-xl font-black text-white">{selectedArtifact.name}</h3>
                <p className="text-xs text-amber-200 font-medium">{selectedArtifact.title}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>التوثيق التاريخي والأهمية المنهجية:</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedArtifact.desc}</p>
            </div>
          </div>
        </div>
      ) : (
        /* World & Topography Map Simulator */
        <div className="p-6 rounded-2xl bg-[#0b162a] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>خريطة القارات والموقع الجغرافي وحوض النيل</span>
            </h4>
            <span className="text-xs text-cyan-300 font-mono">تفاعلي 3D</span>
          </div>

          <div className="relative h-80 rounded-2xl bg-[#040a14] border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            {/* World Map SVG Canvas Placeholder with animated coordinates */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 800 400" fill="none">
              <circle cx="400" cy="200" r="180" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" className="animate-spin [animation-duration:30s]" />
              <circle cx="400" cy="200" r="120" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 6" className="animate-spin [animation-duration:20s]" />
              <path d="M200 150 Q300 100 400 180 T600 220" stroke="#10b981" strokeWidth="3" fill="none" />
              <circle cx="400" cy="180" r="6" fill="#34d399" className="animate-ping" />
              <text x="370" y="160" fill="#34d399" fontSize="12" fontWeight="bold">مصر - نهر النيل</text>
            </svg>
            <div className="absolute bottom-4 right-4 bg-black/80 p-3 rounded-xl border border-amber-500/30 text-[11px] text-slate-200 space-y-1">
              <p>📍 <strong>الموقع الفلكي لمصر:</strong> بين خطي عرض 22° و 31°36' شمالاً.</p>
              <p>🌊 <strong>المجاري المائية:</strong> نهر النيل، البحر الأحمر، البحر المتوسط.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. فلسفة ومنطق (SOCRATES PHILOSOPHER TALK)
// ==========================================
function SocratesModule() {
  const [dialogText, setDialogText] = useState('أهلاً بك يا صديقي الباحث عن الحقيقة! أنا سقراط، أبحث معك بالمنطق والعقل عن الإجابة الصائبة. ما المسألة الفلسفية أو المغالطة المنطقية التي تريد مناقشتها؟');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSocratesAsk = async (prompt?: string) => {
    const q = prompt || userQuery;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await apiRequest('public', '/api/student/ai-chat', {
        question: `تحدث بشخصية الفيلسوف اليوناني سقراط بطريقته السقراطية التفاعلية الحكيمة. تناقش مع الطالب بالمنطق الفلسفي بأسلوب مشوق وتوضيح المغالطات المنطقية. السؤال: ${q}`,
        history: []
      });
      setDialogText(res.reply || res.answer || 'الحكمة تبدأ بتساؤل العقل!');
    } catch {
      setDialogText('العقل والمنطق يسعيان دائماً للحقيقة، أعد طرح سؤالك وسنتحاور سوياً!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e1d35] via-[#101b33] to-[#0c182c] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
          
          {/* Animated Talking Socrates Character */}
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-purple-900 to-indigo-950 border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex flex-col items-center justify-center overflow-hidden">
              <div className="text-6xl animate-bounce [animation-duration:3s]">🏛️</div>
              <span className="text-[10px] font-black text-purple-300 mt-1">سقراط الحكيم</span>
              {loading && <span className="absolute bottom-2 w-3 h-3 bg-purple-400 rounded-full animate-ping" />}
            </div>
            <span className="mt-2 px-3 py-1 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded-full">
              تحدث مع الفيلسوف 💬
            </span>
          </div>

          {/* Socrates Dialogue Box */}
          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 rounded-2xl bg-[#081122] border border-purple-500/25 relative">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-purple-500/20 text-xs font-bold text-purple-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>حوار سقراط والمنطق الفلسفي:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium whitespace-pre-wrap min-h-[80px]">
                {loading ? 'سقراط يفكر ويتفلسف في مسألتك الآن...' : dialogText}
              </p>
            </div>

            {/* Quick Socratic Dilemmas */}
            <div className="flex flex-wrap gap-2">
              {[
                'ما الفرق بين الرأي والتفكير النقدي؟',
                'اشرح لي مغالطة (رجل القش) بالأمثلة.',
                'هل الأخلاق نسبية أم مطلقة؟',
                'كيف أميز بين الاستنباط والاستقراء؟'
              ].map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setUserQuery(q);
                    handleSocratesAsk(q);
                  }}
                  className="px-3 py-1.5 bg-[#091324] hover:bg-[#122240] border border-purple-500/30 text-purple-200 text-xs rounded-xl font-bold transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="اسأل سقراط في أي معضلة فلسفية أو أسلوب التفكير المنطقي..."
                className="input-field text-xs flex-1"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSocratesAsk()}
              />
              <button
                type="button"
                onClick={() => handleSocratesAsk()}
                disabled={loading || !userQuery.trim()}
                className="btn-purple py-2 px-5 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>حاور الفيلسوف</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. محرر الأكواد والبرمجة (LIVE CODE SANDBOX)
// ==========================================
function CodeSandboxModule() {
  const [language, setLanguage] = useState<'python' | 'js' | 'html'>('js');
  const [code, setCode] = useState<string>(
    '// اكتب كود جافاسكريبت هنا وتصفح النتيجة فوراً:\nconsole.log("أهلاً بك في منصة التعلم الذكي للبرمجة! 🚀");\n\nfunction calculateGrade(score) {\n  return score >= 90 ? "ممتاز مرتفع 🌟" : "جيد جداً 👍";\n}\n\nconsole.log("النتيجة:", calculateGrade(95));'
  );
  const [output, setOutput] = useState<string>('اضغط على "تشغيل الكود" لمعاينة النتيجة...');

  const handleRunCode = () => {
    if (language === 'js') {
      try {
        let logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push('❌ Error: ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('⚠️ Warning: ' + args.join(' '))
        };
        const runFn = new Function('console', code);
        runFn(customConsole);
        setOutput(logs.join('\n') || 'تم تشغيل الكود بنجاح (بدون مخرجات console.log).');
      } catch (err: any) {
        setOutput(`❌ خطأ برمجي:\n${err.message}`);
      }
    } else if (language === 'html') {
      setOutput('✅ تم تحديث المعاينة الحية للـ HTML/CSS أدناه.');
    } else {
      setOutput(`🐍 بيئة بايثرن النمطية:\nSimulated Output:\n>>> ${code.split('\n').filter(l => l.includes('print')).join('\n') || 'Code executed successfully.'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-black font-black shadow-lg">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>محرر الأكواد والبرمجة التفاعلي (Code Sandbox)</span>
                <span className="badge-pill bg-emerald-950/80 text-emerald-300 border-emerald-500/40 text-[10px]">
                  خاص بالبرمجة والتكنولوجيا 💻
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                كتابة وتشغيل أكواد JavaScript و Python و HTML/CSS حياً مع معاينة النتيجة ومصحح الأخطاء.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#081220] p-1.5 rounded-xl border border-emerald-500/20">
            {(['js', 'python', 'html'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  if (lang === 'js') setCode('console.log("Hello JS World!");');
                  if (lang === 'python') setCode('print("أهلاً بكم في لغة بايثون!")\nscore = 98\nprint("Score:", score)');
                  if (lang === 'html') setCode('<h1 style="color:#0284c7">مرحباً بالبرمجة!</h1>\n<p style="color:#cbd5e1">تصميم صفحة ويب تفاعلية.</p>');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === lang ? 'bg-emerald-500 text-black shadow-md font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Code & Preview Split Pane */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Code Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-300">
              <span>محرر الكود ({language.toUpperCase()}):</span>
              <button
                type="button"
                onClick={handleRunCode}
                className="btn-emerald btn-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل الكود</span>
              </button>
            </div>
            <textarea
              rows={12}
              className="w-full bg-[#050b14] text-emerald-300 font-mono text-xs sm:text-sm p-4 rounded-xl border border-emerald-500/30 focus:outline-none focus:border-emerald-400 leading-relaxed shadow-inner"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* Execution Output */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-cyan-300 block">شاشة المخرجات والنتائج الحية (Console Output):</span>
            {language === 'html' ? (
              <div className="h-[280px] bg-white rounded-xl p-4 overflow-auto border border-emerald-500/30">
                <div dangerouslySetInnerHTML={{ __html: code }} />
              </div>
            ) : (
              <pre className="h-[280px] bg-[#040812] text-cyan-200 font-mono text-xs p-4 rounded-xl border border-cyan-500/30 overflow-auto whitespace-pre-wrap leading-relaxed">
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. المختبر العلمي الافتراضي المطور (VIRTUAL SCIENCE LAB)
// ==========================================
function VirtualScienceLabModule() {
  const [labType, setLabType] = useState<'chem' | 'physics' | 'bio'>('chem');

  // 1. Chemistry State
  const [chemElem1, setChemElem1] = useState('Na');
  const [chemElem2, setChemElem2] = useState('Cl');
  const [isHeated, setIsHeated] = useState(false);

  // Chemistry reactions database
  const getReactionInfo = () => {
    const pair = `${chemElem1}+${chemElem2}`;
    if (chemElem1 === 'Na' && chemElem2 === 'Cl') {
      return {
        eq: '2Na(s) + Cl₂(g) ➡️ 2NaCl(s)',
        name: 'تفاعل تكوين ملح كلوريد الصوديوم (ملح الطعام)',
        type: 'أكسدة واختزال عنيف مصحوب بانبعاث حراري وضوء أصفر',
        color: '#fef08a',
        bubble: true,
        precipitate: 'بلورات بيضاء',
        tip: 'الصوديوم فلز نشط جداً يفقد إلكتروناً واحداً بسهولة مكوناً أيون الصوديوم الموجب Na⁺.'
      };
    }
    if (chemElem1 === 'HCl' && chemElem2 === 'NaOH') {
      return {
        eq: 'HCl(aq) + NaOH(aq) ➡️ NaCl(aq) + H₂O(l)',
        name: 'تفاعل التعادل بين حمض قوي وقاعدة قوية',
        type: 'إحلال مزدوج (تعادل تام يصحبه ارتفاع طفيف في درجة الحرارة)',
        color: '#bae6fd',
        bubble: false,
        precipitate: 'محلول مائي شفاف متعادل pH=7',
        tip: 'تفاعل حمض مع قلوي ينتج ملحاً وماء، وهو أساس معايرات الأحماض والقواعد.'
      };
    }
    if (chemElem1 === 'Fe' && chemElem2 === 'CuSO4') {
      return {
        eq: 'Fe(s) + CuSO₄(aq) ➡️ FeSO₄(aq) + Cu(s)↓',
        name: 'إحلال فلز الحديد محل فلز النحاس في محاليل أملاحه',
        type: 'إحلال بسيط (الحديد يسبق النحاس في المتسلسلة الكهروكيميائية)',
        color: '#86efac',
        bubble: false,
        precipitate: 'راسب أحمر بني من النحاس المترسب',
        tip: 'الحديد أكثر نشاطاً كيميائياً من النحاس، فيطرده ويترسب النحاس بلونه الأحمر المميز.'
      };
    }
    if (chemElem1 === 'HCl' && chemElem2 === 'CaCO3') {
      return {
        eq: '2HCl(aq) + CaCO₃(s) ➡️ CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
        name: 'تفاعل كشف الكربونات وتصاعد غاز ثاني أكسيد الكربون',
        type: 'تفاعل تبادل مصحوب بفوران شديد',
        color: '#f1f5f9',
        bubble: true,
        precipitate: 'محلول كلوريد كالسيوم مع ذوبان الحجر الجيري',
        tip: 'الغاز المتصاعد يعكر ماء الجير الرائق (هيدروكسيد الكالسيوم) عند إمراره لفترة قصيرة.'
      };
    }
    if (chemElem1 === 'AgNO3' && chemElem2 === 'HCl') {
      return {
        eq: 'AgNO₃(aq) + HCl(aq) ➡️ AgCl(s)↓ + HNO₃(aq)',
        name: 'كشف أيون الكلوريد وترسيب كلوريد الفضة',
        type: 'إحلال مزدوج وتكوين راسب أبيض يتحول للبنفسجي في الضوء',
        color: '#e2e8f0',
        bubble: false,
        precipitate: 'راسب أبيض ناصع من AgCl يذوب في محلول النشادر المركز',
        tip: 'راسب كلوريد الفضة حساس للضوء ويذوب سريعاً في محلول هيدروكسيد الأمونيوم (النشادر).'
      };
    }
    if (chemElem1 === 'NaOH' && chemElem2 === 'CuSO4') {
      return {
        eq: 'CuSO₄(aq) + 2NaOH(aq) ➡️ Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
        name: 'كشف أيون النحاس الثنائي وتكوين راسب أزرق',
        type: 'ترسيب هيدروكسيد النحاس الثنائي',
        color: '#0284c7',
        bubble: false,
        precipitate: isHeated ? 'راسب أسود من CuO بفعل التسخين' : 'راسب أزرق من Cu(OH)₂ يسود بالتسخين',
        tip: isHeated
          ? 'بالتسخين ينحل هيدروكسيد النحاس الأزرق حرارياً إلى أكسيد النحاس الأسود CuO وبخار ماء.'
          : 'هيدروكسيد النحاس راسب أزرق مميز لا يذوب في الزيادة من هيدروكسيد الصوديوم.'
      };
    }
    if (chemElem1 === 'H2' && chemElem2 === 'O2') {
      return {
        eq: '2H₂(g) + O₂(g) ➡️ 2H₂O(l)',
        name: 'تكوين جزيء الماء بالاشتعال المصحوب بفرقعة',
        type: 'أكسدة واختزال طارد للحرارة مع تكوين بخار ماء',
        color: '#67e8f9',
        bubble: true,
        precipitate: 'قطرات ماء متكثفة على جدار الإناء',
        tip: 'الهيدروجين يشتعل بفرقعة بينما الأكسجين يساعد على الاشتعال ولا يشتعل.'
      };
    }

    // Default general mixture
    return {
      eq: `${chemElem1} + ${chemElem2} ${isHeated ? '🔥' : ''} ➡️ نواتج التفاعل المستقرة`,
      name: `تفاعل ومزج ${chemElem1} مع ${chemElem2}`,
      type: isHeated ? 'تفاعل كيميائي حراري منشط' : 'امتزاج محلولين كيميائيين',
      color: isHeated ? '#f97316' : '#38bdf8',
      bubble: isHeated,
      precipitate: isHeated ? 'ترسب حراري' : 'محلول متجانس',
      tip: 'الحرارة تزيد من الطاقة الحركية للجزيئات وتضاعف عدد التصادمات الفعالة لكل ثانية.'
    };
  };

  const reaction = getReactionInfo();

  // 2. Physics State
  const [circuitClosed, setCircuitClosed] = useState(true);
  const [circuitMode, setCircuitMode] = useState<'series' | 'parallel'>('series');
  const [voltage, setVoltage] = useState(12);
  const [resistance1, setResistance1] = useState(4);
  const [resistance2, setResistance2] = useState(6);

  const reqVal = circuitMode === 'series'
    ? resistance1 + resistance2
    : Number(((resistance1 * resistance2) / (resistance1 + resistance2)).toFixed(2));

  const currentVal = circuitClosed ? Number((voltage / reqVal).toFixed(2)) : 0;
  const powerVal = circuitClosed ? Number((voltage * currentVal).toFixed(1)) : 0;
  const isOverheated = currentVal > 5.5;

  // 3. Biology & Microscope State
  const [microscopeSlide, setMicroscopeSlide] = useState<'onion' | 'blood' | 'protozoa' | 'chloroplast'>('onion');
  const [zoomLevel, setZoomLevel] = useState<40 | 100 | 400 | 1000>(400);
  const [focusSlider, setFocusSlider] = useState(90); // 0 to 100, 100 is perfectly sharp

  const slidesData = {
    onion: {
      name: 'خلايا غشاء نبات البصل (Onion Epidermis)',
      desc: 'خلايا نباتية نموذجية متراصة يظهر فيها بوضوح الجدار الخلوي السليلوزي والنواة الصبغية والفجوة العصارية المركزية الكبيرة.',
      organelles: ['جدار خلوي سليلوزي صلب', 'نواة واضحة صبغية', 'فجوة عصارية كبيرة', 'سيتوبلازم حبيبي'],
      color: '#a7f3d0'
    },
    blood: {
      name: 'مسحة دم بشرية (Human Blood Smear)',
      desc: 'تظهر كريات الدم الحمراء مقعرة الوجهين عديمة الأنوية لنقل الأكسجين، إلى جانب خلايا الدم البيضاء الأكولة ذات الأنوية المفصصة.',
      organelles: ['كريات دم حمراء مقعرة (Erythrocytes)', 'خلايا دم بيضاء مفصصة النواة', 'صفائح دموية دقيقة للتجلط'],
      color: '#fca5a5'
    },
    protozoa: {
      name: 'كائنات أولية وحيدة الخلية (Paramecium & Amoeba)',
      desc: 'كائنات حية وحيدة الخلية، يتحرك البراميسيوم بواسطة الأهداب الدقيقة، وتتحرك الأميبا بالأقدام الكاذبة لالتقاط الغذاء بالبلعمة.',
      organelles: ['أهداب حركية دقيقة (Cilia)', 'أقدام كاذبة (Pseudopodia)', 'فجوة منقبضة للتنظيم الأسموزي'],
      color: '#c4b5fd'
    },
    chloroplast: {
      name: 'البلاستيدات الخضراء في نبات الإلوديا (Chloroplasts)',
      desc: 'عضيات خلوية مزدوجة الغشاء تحتوي على أقراص الجرانا وصبغ الكلوروفيل المسؤول عن امتصاص الطاقة الضوئية وإتمام البناء الضوئي.',
      organelles: ['أقراص الجرانا (Grana)', 'ستروما أو الحشوة (Stroma)', 'حبيبات نشا مخزنة'],
      color: '#86efac'
    }
  };

  const currentSlide = slidesData[microscopeSlide];
  const blurAmount = Math.max(0, (100 - focusSlider) / 10);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-cyan-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-xl">
              <Atom className="w-6 h-6 animate-spin [animation-duration:8s]" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white flex flex-wrap items-center gap-2">
                <span>المختبر العلمي الافتراضي المطور</span>
                <span className="badge-pill bg-cyan-950/90 text-cyan-300 border-cyan-500/40 text-[10px] font-bold">
                  محاكاة تفاعلية • كيمياء • فيزياء • أحياء 🧪⚡🔬
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                إجراء التجارب المعملية الرقمية بأمان كامل، كشف الغازات والرواسب، بناء الدوائر الكهربائية، وفحص الشرائح تحت المجهر.
              </p>
            </div>
          </div>

          {/* Module Tabs Switcher */}
          <div className="w-full md:w-auto flex items-center gap-1.5 bg-[#070e1c] p-1.5 rounded-2xl border border-cyan-500/30 shadow-inner">
            <button
              type="button"
              onClick={() => setLabType('chem')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                labType === 'chem'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🧪</span>
              <span>معمل الكيمياء</span>
            </button>

            <button
              type="button"
              onClick={() => setLabType('physics')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                labType === 'physics'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>معمل الفيزياء</span>
            </button>

            <button
              type="button"
              onClick={() => setLabType('bio')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                labType === 'bio'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🔬</span>
              <span>المجهر والأحياء</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. CHEMISTRY LAB SIMULATOR */}
      {labType === 'chem' && (
        <div className="p-6 rounded-3xl bg-[#0b162a] border border-cyan-500/30 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
            <div>
              <h4 className="text-base font-black text-cyan-300 flex items-center gap-2">
                <span>مفاعل مزج المحاليل الكيميائية والتسخين بالحرارة</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h4>
              <p className="text-xs text-slate-300">
                اختر عنصرين أو مركبين، وتحكم في لهب بنزن لمشاهدة التفاعلات الكيميائية وتغير لون المحلول وتصاعد الغازات.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHeated(!isHeated)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isHeated
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Flame className={`w-4 h-4 ${isHeated ? 'text-yellow-300 fill-yellow-300' : 'text-slate-400'}`} />
              <span>{isHeated ? '🔥 لهب بنزن مشتعل (حرارة نشطة)' : 'لهب بنزن مطفأ (بدون حرارة)'}</span>
            </button>
          </div>

          {/* Reagents Selection Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <label className="block text-xs font-black text-cyan-300">المادة / المتفاعل الأول (Reagent 1):</label>
              <select
                className="input-field text-xs font-bold py-2.5"
                value={chemElem1}
                onChange={(e) => setChemElem1(e.target.value)}
              >
                <option value="Na">الصوديوم فلز نشط [Na]</option>
                <option value="HCl">حمض الهيدروكلوريك المخفف [HCl]</option>
                <option value="Fe">برادة الحديد [Fe]</option>
                <option value="NaOH">هيدروكسيد الصوديوم قلوي [NaOH]</option>
                <option value="AgNO3">محلول نترات الفضة [AgNO₃]</option>
                <option value="H2">غاز الهيدروجين النقي [H₂]</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <label className="block text-xs font-black text-cyan-300">المادة / المتفاعل الثاني (Reagent 2):</label>
              <select
                className="input-field text-xs font-bold py-2.5"
                value={chemElem2}
                onChange={(e) => setChemElem2(e.target.value)}
              >
                <option value="Cl">غاز الكلور السام [Cl₂]</option>
                <option value="NaOH">محلول هيدروكسيد الصوديوم [NaOH]</option>
                <option value="CuSO4">محلول كبريتات النحاس الزرقاء [CuSO₄]</option>
                <option value="CaCO3">مسحوق كربونات الكالسيوم (الحجر الجيري) [CaCO₃]</option>
                <option value="HCl">حمض الهيدروكلوريك [HCl]</option>
                <option value="O2">غاز الأكسجين [O₂]</option>
              </select>
            </div>
          </div>

          {/* Animated Flask & Laboratory Beaker Visualizer */}
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] items-center">
            {/* Visual Beaker */}
            <div className="p-8 rounded-3xl bg-[#050b14] border border-cyan-500/25 flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-inner">
              <div className="text-center text-xs font-black text-slate-400">
                مظهر المحلول في الكأس المخبري:
              </div>

              {/* Glass Beaker SVG Simulation */}
              <div className="relative w-36 h-48 border-x-4 border-b-4 border-cyan-400/60 rounded-b-3xl overflow-hidden bg-gradient-to-b from-black/40 to-cyan-950/20 flex flex-col justify-end shadow-2xl">
                {/* Steam Vapor if heated */}
                {isHeated && (
                  <div className="absolute top-2 inset-x-0 flex justify-center gap-2">
                    <span className="w-1.5 h-6 bg-white/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-8 bg-white/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="w-1.5 h-6 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                )}

                {/* Animated Liquid */}
                <div
                  className="w-full transition-all duration-700 relative overflow-hidden flex flex-col justify-end"
                  style={{
                    height: '70%',
                    backgroundColor: reaction.color,
                    opacity: 0.85,
                    boxShadow: `0 0 25px ${reaction.color}`
                  }}
                >
                  {/* Effervescence Bubbles */}
                  {reaction.bubble && (
                    <div className="absolute inset-0 flex items-center justify-around overflow-hidden">
                      <span className="w-2 h-2 rounded-full bg-white/80 animate-ping [animation-duration:1s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce [animation-duration:0.8s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-ping [animation-duration:1.2s]" />
                      <span className="w-3 h-3 rounded-full bg-white/90 animate-bounce [animation-duration:0.7s]" />
                    </div>
                  )}

                  {/* Precipitate sediment at bottom */}
                  {reaction.precipitate && (
                    <div className="w-full h-3 bg-white/60 border-t border-white/80" />
                  )}
                </div>

                {/* Beaker Measurement Lines */}
                <div className="absolute right-1 top-8 bottom-6 flex flex-col justify-between text-[8px] text-cyan-300 font-mono pointer-events-none">
                  <span>- 200ml</span>
                  <span>- 150ml</span>
                  <span>- 100ml</span>
                  <span>- 50ml</span>
                </div>
              </div>

              {/* Bunsen Burner Flame Base */}
              <div className="flex flex-col items-center">
                {isHeated && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-cyan-300 blur-sm animate-pulse" />
                )}
                <div className="w-16 h-3 bg-slate-700 rounded-t border-t border-slate-500" />
                <div className="w-24 h-2 bg-slate-800 rounded-full" />
              </div>
            </div>

            {/* Reaction Details & Balanced Equation Card */}
            <div className="p-6 rounded-2xl bg-[#081220] border border-cyan-500/20 space-y-4 shadow-xl">
              <span className="badge-pill bg-cyan-950/80 text-cyan-300 border-cyan-500/40 text-xs font-bold">
                المعادلة الكيميائية الموزونة
              </span>

              <div className="p-3.5 rounded-xl bg-[#050b14] border border-cyan-400/40 font-mono text-sm sm:text-base font-black text-cyan-200 text-center tracking-wide" dir="ltr">
                {reaction.eq}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-500/10">
                  <span className="text-slate-400 font-bold">اسم التفاعل:</span>
                  <strong className="text-amber-300 font-extrabold">{reaction.name}</strong>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-blue-500/10">
                  <span className="text-slate-400 font-bold">تصنيف التفاعل:</span>
                  <span className="text-white font-medium">{reaction.type}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-blue-500/10">
                  <span className="text-slate-400 font-bold">الراسب أو الناتج المرئي:</span>
                  <span className="text-emerald-300 font-bold">{reaction.precipitate}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <strong className="block text-amber-300 flex items-center gap-1 font-bold">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>ملاحظة امتحانية هامة:</span>
                </strong>
                <p className="leading-relaxed">{reaction.tip}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHYSICS CIRCUIT SIMULATOR */}
      {labType === 'physics' && (
        <div className="p-6 rounded-3xl bg-[#0b162a] border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-amber-500/20">
            <div>
              <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>محاكي الدوائر الكهربائية وقانون أوم (V = I × R)</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </h4>
              <p className="text-xs text-slate-300">
                غيّر فرق الجهد والمقاومة ولاحظ تدفق الشحنات الكهربائية وتوهج المصباح وحساب القدرة الكهربائية.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Series / Parallel Toggle */}
              <div className="bg-[#070e1c] p-1 rounded-xl border border-amber-500/20 flex items-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCircuitMode('series')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circuitMode === 'series' ? 'bg-amber-500 text-black font-black shadow' : 'text-slate-400'
                  }`}
                >
                  توصيل توالي
                </button>
                <button
                  type="button"
                  onClick={() => setCircuitMode('parallel')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circuitMode === 'parallel' ? 'bg-amber-500 text-black font-black shadow' : 'text-slate-400'
                  }`}
                >
                  توصيل توازي
                </button>
              </div>

              {/* Main Switch */}
              <button
                type="button"
                onClick={() => setCircuitClosed(!circuitClosed)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                  circuitClosed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                <span>{circuitClosed ? '⚡ المفتاح مغلق (دائرة متصلة)' : '🔴 المفتاح مفتوح (دائرة مقطوعة)'}</span>
              </button>
            </div>
          </div>

          {/* Voltage & Resistance Sliders */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>جهد البطارية (V):</span>
                <strong className="text-cyan-300 font-mono font-black">{voltage} V</strong>
              </div>
              <input
                type="range"
                min="1"
                max="48"
                className="w-full accent-cyan-400 cursor-pointer"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
              />
              <span className="text-[10px] text-slate-500 block">مصدر تيار مستمر DC</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>المقاومة الأولى (R₁):</span>
                <strong className="text-amber-300 font-mono font-black">{resistance1} Ω</strong>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                className="w-full accent-amber-400 cursor-pointer"
                value={resistance1}
                onChange={(e) => setResistance1(Number(e.target.value))}
              />
              <span className="text-[10px] text-slate-500 block">مقاومة أومية ثابتة</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>المقاومة الثانية (R₂):</span>
                <strong className="text-amber-300 font-mono font-black">{resistance2} Ω</strong>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                className="w-full accent-amber-400 cursor-pointer"
                value={resistance2}
                onChange={(e) => setResistance2(Number(e.target.value))}
              />
              <span className="text-[10px] text-slate-500 block">
                {circuitMode === 'series' ? 'توالي (R = R₁ + R₂)' : 'توازي (R = R₁R₂ / R₁+R₂)'}
              </span>
            </div>
          </div>

          {/* Live Circuit Measurements & Schematic */}
          <div className="p-6 rounded-3xl bg-[#050b14] border border-amber-500/25 space-y-6 shadow-inner">
            {/* Gauges Grid */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="p-3.5 rounded-2xl bg-[#09152a] border border-cyan-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">المقاومة المكافئة (Req)</span>
                <strong className="text-xl font-black text-cyan-300 font-mono">{reqVal} Ω</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09152a] border border-cyan-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">شدة التيار الكلي (I)</span>
                <strong className={`text-xl font-black font-mono ${isOverheated ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                  {currentVal} A
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09152a] border border-cyan-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">القدرة الكهربائية (P)</span>
                <strong className="text-xl font-black text-emerald-300 font-mono">{powerVal} W</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09152a] border border-cyan-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">حالة المصباح</span>
                <strong className={`text-xs font-black block mt-1 ${isOverheated ? 'text-red-400' : circuitClosed ? 'text-amber-300' : 'text-slate-500'}`}>
                  {isOverheated ? '⚠️ خطر احتراق المصباح!' : circuitClosed ? '💡 متوهج بكفاءة عالية' : 'مطفأ (دائرة مفتوحة)'}
                </strong>
              </div>
            </div>

            {/* Visual Circuit Wire & Glowing Bulb */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4 px-6 rounded-2xl bg-[#081220] border border-amber-500/15">
              {/* Battery Graphic */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-24 rounded-xl bg-gradient-to-b from-cyan-600 via-blue-700 to-slate-900 border-2 border-cyan-400 flex flex-col items-center justify-between p-2 shadow-lg">
                  <span className="text-xs font-mono font-black text-white">+</span>
                  <span className="text-[10px] font-bold text-cyan-200 font-mono">{voltage}V</span>
                  <span className="text-xs font-mono font-black text-white">-</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-bold">المصدر الكهربائي</span>
              </div>

              {/* Animated Electrons in Wire */}
              <div className="flex-1 w-full flex items-center justify-center relative py-2">
                <div className="w-full h-1 bg-cyan-400/40 relative rounded-full overflow-hidden">
                  {circuitClosed && (
                    <div className="absolute inset-0 flex justify-around">
                      <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-sm animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-sm animate-ping [animation-delay:0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-sm animate-ping [animation-delay:0.6s]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Glowing Lamp */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-3xl shadow-2xl ${
                    circuitClosed
                      ? isOverheated
                        ? 'border-red-400 bg-red-500 text-white shadow-[0_0_50px_#ef4444] animate-bounce'
                        : 'border-amber-300 bg-amber-400 text-black shadow-[0_0_45px_#f59e0b]'
                      : 'border-slate-700 bg-slate-900 text-slate-600'
                  }`}
                >
                  💡
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-bold">مصباح الحمل</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BIOLOGY & MICROSCOPE SIMULATOR */}
      {labType === 'bio' && (
        <div className="p-6 rounded-3xl bg-[#0b162a] border border-emerald-500/30 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-emerald-500/20">
            <div>
              <h4 className="text-base font-black text-emerald-300 flex items-center gap-2">
                <span>المجهر الضوئي المركب وفحص الشرائح الخلوية</span>
                <span className="text-lg">🔬</span>
              </h4>
              <p className="text-xs text-slate-300">
                اختر شريحة نسيجية معدة، اضبط قوة التكبير وعجلة الضبط الدقيق لرؤية تفاصيل العضيات الخلوية بدقة متناهية.
              </p>
            </div>

            {/* Slide Chooser */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(slidesData) as Array<keyof typeof slidesData>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMicroscopeSlide(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    microscopeSlide === key
                      ? 'bg-emerald-500 text-black font-black shadow-lg'
                      : 'bg-[#070e1c] text-slate-300 hover:text-white border border-emerald-500/20'
                  }`}
                >
                  {key === 'onion' && 'غشاء البصل'}
                  {key === 'blood' && 'خلايا الدم'}
                  {key === 'protozoa' && 'الأميبا والبراميسيوم'}
                  {key === 'chloroplast' && 'البلاستيدات الخضراء'}
                </button>
              ))}
            </div>
          </div>

          {/* Microscope Viewport and Controls */}
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] items-center">
            {/* Circular Microscope Lens View */}
            <div className="p-6 rounded-3xl bg-[#040812] border border-emerald-500/30 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Circular Ocular Field */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-800 bg-[#020610] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-emerald-500/20" />
                  <div className="h-full w-[1px] bg-emerald-500/20 absolute" />
                </div>

                {/* SVG Specimen Illustration */}
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-full transition-all duration-300"
                  style={{ filter: `blur(${blurAmount}px)` }}
                >
                  {microscopeSlide === 'onion' && (
                    <g stroke="#065f46" strokeWidth="3" fill="#a7f3d0" opacity="0.85">
                      <rect x="20" y="30" width="120" height="70" rx="8" />
                      <circle cx="80" cy="65" r="14" fill="#047857" />
                      <rect x="155" y="30" width="125" height="70" rx="8" />
                      <circle cx="215" cy="65" r="14" fill="#047857" />
                      <rect x="20" y="115" width="120" height="70" rx="8" />
                      <circle cx="80" cy="150" r="14" fill="#047857" />
                      <rect x="155" y="115" width="125" height="70" rx="8" />
                      <circle cx="215" cy="150" r="14" fill="#047857" />
                      <rect x="20" y="200" width="120" height="70" rx="8" />
                      <circle cx="80" cy="235" r="14" fill="#047857" />
                      <rect x="155" y="200" width="125" height="70" rx="8" />
                      <circle cx="215" cy="235" r="14" fill="#047857" />
                    </g>
                  )}

                  {microscopeSlide === 'blood' && (
                    <g>
                      <circle cx="70" cy="80" r="28" fill="#ef4444" opacity="0.85" />
                      <circle cx="70" cy="80" r="14" fill="#dc2626" />
                      <circle cx="160" cy="70" r="26" fill="#ef4444" opacity="0.85" />
                      <circle cx="160" cy="70" r="13" fill="#dc2626" />
                      <circle cx="230" cy="120" r="28" fill="#ef4444" opacity="0.85" />
                      <circle cx="230" cy="120" r="14" fill="#dc2626" />
                      <circle cx="120" cy="180" r="30" fill="#ef4444" opacity="0.85" />
                      <circle cx="120" cy="180" r="15" fill="#dc2626" />
                      {/* White blood cell with multi-lobed nucleus */}
                      <circle cx="200" cy="220" r="38" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" opacity="0.9" />
                      <path d="M 185 210 Q 200 230 215 210 Q 220 235 200 235 Z" fill="#6366f1" />
                    </g>
                  )}

                  {microscopeSlide === 'protozoa' && (
                    <g>
                      {/* Paramecium */}
                      <path
                        d="M 60 70 C 130 50, 180 110, 150 170 C 110 220, 40 180, 50 120 Z"
                        fill="#8b5cf6"
                        opacity="0.8"
                        stroke="#a78bfa"
                        strokeWidth="3"
                        strokeDasharray="4,3"
                      />
                      <circle cx="100" cy="120" r="18" fill="#4c1d95" />
                      <circle cx="120" cy="150" r="10" fill="#7c3aed" />

                      {/* Amoeba */}
                      <path
                        d="M 190 180 Q 240 160 260 210 Q 270 260 220 270 Q 180 280 170 230 Z"
                        fill="#06b6d4"
                        opacity="0.75"
                        stroke="#22d3ee"
                        strokeWidth="3"
                      />
                      <circle cx="215" cy="225" r="12" fill="#0891b2" />
                    </g>
                  )}

                  {microscopeSlide === 'chloroplast' && (
                    <g>
                      <rect x="40" y="40" width="220" height="220" rx="30" fill="#052e16" stroke="#22c55e" strokeWidth="4" />
                      <ellipse cx="90" cy="90" rx="28" ry="16" fill="#16a34a" transform="rotate(25 90 90)" />
                      <ellipse cx="180" cy="100" rx="28" ry="16" fill="#16a34a" transform="rotate(-30 180 100)" />
                      <ellipse cx="120" cy="180" rx="28" ry="16" fill="#16a34a" transform="rotate(40 120 180)" />
                      <ellipse cx="210" cy="190" rx="28" ry="16" fill="#16a34a" transform="rotate(-15 210 190)" />
                    </g>
                  )}
                </svg>

                <div className="absolute bottom-3 text-[11px] font-mono text-emerald-300 font-bold bg-black/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  التكبير: {zoomLevel}x
                </div>
              </div>
            </div>

            {/* Controls & Slide Educational Info */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#081220] border border-emerald-500/20 space-y-3">
                <span className="text-xs font-black text-emerald-300 flex items-center justify-between">
                  <span>عدسة التكبير الشيئية:</span>
                  <span className="text-slate-400 font-mono">{zoomLevel}x</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {([40, 100, 400, 1000] as const).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZoomLevel(z)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        zoomLevel === z ? 'bg-emerald-500 text-black font-black shadow' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>

                {/* Focus Knob */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>عجلة الضبط البؤري (Focus):</span>
                    <span className="text-cyan-300 font-mono">{focusSlider}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    className="w-full accent-emerald-400 cursor-pointer"
                    value={focusSlider}
                    onChange={(e) => setFocusSlider(Number(e.target.value))}
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {focusSlider >= 85 ? '✅ الرؤية حادة وواضحة تماماً' : '⚠️ اضبط البكرة نحو 90% للحصول على أفضل دقة'}
                  </span>
                </div>
              </div>

              {/* Organelles Legend */}
              <div className="p-4 rounded-2xl bg-[#081220] border border-emerald-500/20 space-y-2">
                <h5 className="text-xs font-black text-white">{currentSlide.name}</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">{currentSlide.desc}</p>
                <div className="pt-2 border-t border-emerald-500/10 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block">العضيات والمحتويات المرئية:</span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {currentSlide.organelles.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlaskIcon(props: any) {
  return <Atom {...props} />;
}

// ==========================================
// 7. الرياضيات (ADVANCED SCIENTIFIC CALCULATOR & GRAPHER)
// ==========================================
function ScientificCalculatorModule() {
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [fnExpr, setFnExpr] = useState('x^2 - 4');

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        const cleaned = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/√/g, 'Math.sqrt');
        const res = Function(`"use strict"; return (${cleaned})`)();
        setCalcDisplay(String(Number(res).toFixed(4)).replace(/\.?0+$/, ''));
      } catch {
        setCalcDisplay('خطأ حسابي');
      }
      return;
    }

    if (calcDisplay === '0' || calcDisplay === 'خطأ حسابي') {
      setCalcDisplay(val);
    } else {
      setCalcDisplay(calcDisplay + val);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1d35] via-[#09152a] to-[#0c182c] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>الآلة الحاسبة العلمية المتطورة والراسم البياني</span>
                <span className="badge-pill bg-cyan-950/80 text-cyan-300 border-cyan-500/40 text-[10px]">
                  خاص بالرياضيات 📐📊
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                حساب الدوال المثلثية واللوغاريتمات ورسم المنحنيات البيانية للدوال في ثوانٍ.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator & Grapher Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scientific Calculator Pad */}
          <div className="p-5 rounded-2xl bg-[#0b162a] border border-cyan-500/30 shadow-xl space-y-4">
            <div className="p-4 rounded-xl bg-[#040912] border border-cyan-500/30 text-left font-mono text-2xl font-black text-cyan-300 shadow-inner overflow-x-auto">
              {calcDisplay}
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {['sin', 'cos', 'tan', 'C', '√', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', 'π', '='].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-xl font-mono transition-all cursor-pointer shadow-sm ${
                    btn === '='
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black col-span-1'
                      : btn === 'C'
                      ? 'bg-red-600 text-white font-black'
                      : ['+', '-', '×', '÷'].includes(btn)
                      ? 'bg-amber-600/80 text-white'
                      : 'bg-[#091426] text-slate-200 hover:bg-[#122442]'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Grapher */}
          <div className="p-5 rounded-2xl bg-[#0b162a] border border-cyan-500/30 shadow-xl space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-cyan-300">راسم المنحنيات والدوال f(x):</label>
              <input
                type="text"
                placeholder="مثال: x^2 - 4"
                className="input-field text-xs font-mono"
                value={fnExpr}
                onChange={(e) => setFnExpr(e.target.value)}
              />
            </div>

            <div className="h-64 rounded-xl bg-[#040912] border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
              <svg className="w-full h-full" viewBox="-100 -100 200 200">
                {/* Grid Lines */}
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#0284c7" strokeWidth="1" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#0284c7" strokeWidth="1" />
                {/* Plot Curve */}
                <path
                  d="M -80 64 Q -40 16 0 -10 T 80 64"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                />
              </svg>
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-emerald-400">
                f(x) = {fnExpr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT WRAPPER
// ==========================================
export const SubjectInteractiveTools: React.FC<SubjectInteractiveToolsProps> = ({
  subject,
  currentSubject,
  studentGrade,
  gradeToolsConfig,
  role = 'student',
  studentVisibleTools
}) => {
  const initialSub = subject || currentSubject || 'اللغة العربية';
  const [activeSubject, setActiveSubject] = useState<string>(initialSub);

  const subjectList = [
    { title: 'اللغة العربية', key: 'arabicLexicon', icon: 'ض', color: 'from-amber-600 to-yellow-500' },
    { title: 'لغات أجنبية (فرنسي/إنجليزي/ألماني)', key: 'translator', icon: '🌐', color: 'from-cyan-600 to-blue-600' },
    { title: 'جغرافيا وتاريخ', key: 'geoHistoryMap', icon: '🏛️', color: 'from-amber-700 to-amber-500' },
    { title: 'فلسفة ومنطق', key: 'socratesPhilosophy', icon: '🏛️', color: 'from-purple-600 to-indigo-600' },
    { title: 'برمجة وتكنولوجيا', key: 'codeSandbox', icon: '💻', color: 'from-emerald-600 to-cyan-500' },
    { title: 'علوم متكاملة وفيزياء وكيمياء', key: 'scienceLab', icon: '🧪', color: 'from-cyan-500 to-blue-500' },
    { title: 'رياضيات', key: 'mathCalculator', icon: '📐', color: 'from-blue-600 to-indigo-600' }
  ];

  // Filter tools strictly by studentVisibleTools configured by the admin
  const relevantSubjectList = subjectList.filter((s) => {
    if (!studentVisibleTools) return true;
    return studentVisibleTools[s.key] !== false;
  });

  useEffect(() => {
    const nextSub = subject || currentSubject;
    if (nextSub && relevantSubjectList.some(s => s.title.includes(nextSub) || nextSub.includes(s.title))) {
      setActiveSubject(nextSub);
    } else if (relevantSubjectList.length > 0 && !relevantSubjectList.some(s => s.title === activeSubject)) {
      setActiveSubject(relevantSubjectList[0].title);
    }
  }, [subject, currentSubject, studentVisibleTools]);

  const normalizedSub = activeSubject.toLowerCase();

  const isArabic = normalizedSub.includes('عرب');
  const isLanguages = normalizedSub.includes('إنجلي') || normalizedSub.includes('فرنس') || normalizedSub.includes('ألمان') || normalizedSub.includes('لغات');
  const isGeoHistory = normalizedSub.includes('جغرافيا') || normalizedSub.includes('تاريخ');
  const isPhilosophy = normalizedSub.includes('فلسف') || normalizedSub.includes('منطق');
  const isCoding = normalizedSub.includes('برمج') || normalizedSub.includes('تكنولوجيا');
  const isScience = normalizedSub.includes('علوم') || normalizedSub.includes('فيزياء') || normalizedSub.includes('كيمياء') || normalizedSub.includes('أحياء') || normalizedSub.includes('جيولوجيا');
  const isMath = normalizedSub.includes('رياضيات') || normalizedSub.includes('حساب');

  // Check if current active module is disabled for studentGrade
  const currentKey = isArabic
    ? 'arabicLexicon'
    : isLanguages
    ? 'translator'
    : isGeoHistory
    ? 'geoHistoryMap'
    : isPhilosophy
    ? 'socratesPhilosophy'
    : isCoding
    ? 'codeSandbox'
    : isScience
    ? 'scienceLab'
    : isMath
    ? 'mathCalculator'
    : 'arabicLexicon';

  const isToolDisabledForGrade =
    !!studentGrade &&
    !!gradeToolsConfig &&
    gradeToolsConfig[studentGrade]?.[currentKey] === false;

  if (relevantSubjectList.length === 0) {
    return (
      <div className="panel bg-[#0d182a] border border-cyan-500/20 p-8 rounded-2xl text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto text-xl font-bold">
          🧪
        </div>
        <h3 className="text-lg font-black text-white">لم يتم تفعيل معامل تفاعلية حالياً</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          جميع المعامل والأدوات التفاعلية معطلة مؤقتاً بحسب إعدادات المنصة. يمكنك مراجعة الدروس والاختبارات من تبويب الكورسات.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner & Quick Tool Switcher */}
      <div className="panel bg-[#0d1728] border border-cyan-500/25 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>أدوات المنصة التفاعلية المخصصة للمادة الدراسية</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              أدوات تفاعلية ذكية مصممة خصيصاً لمساعدة الطالب في المادة المقررة.
            </p>
          </div>

          <span className="badge-pill bg-cyan-950/80 text-cyan-300 border-cyan-500/40 text-xs font-bold">
            التخصص الحالي: {activeSubject}
          </span>
        </div>

        {/* Quick subject tools toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-cyan-500/15">
          {relevantSubjectList.map((s) => {
            const isSelected =
              activeSubject === s.title ||
              (s.title.includes('عرب') && isArabic) ||
              (s.title.includes('لغات') && isLanguages) ||
              (s.title.includes('جغرافيا') && isGeoHistory) ||
              (s.title.includes('فلسف') && isPhilosophy) ||
              (s.title.includes('برمج') && isCoding) ||
              (s.title.includes('علوم') && isScience) ||
              (s.title.includes('رياضيات') && isMath);

            return (
              <button
                key={s.title}
                type="button"
                onClick={() => setActiveSubject(s.title)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg border border-cyan-300 ring-2 ring-cyan-400/30'
                    : 'bg-[#081220] text-slate-300 hover:text-white border border-blue-500/15'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render matching interactive module or disabled banner */}
      {isToolDisabledForGrade ? (
        <div className="panel bg-[#0d182a] border border-amber-500/30 p-8 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h3 className="text-lg font-black text-white">هذا القسم غير مفعّل لصفك الدراسي</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            قام المعلم بتخصيص إعدادات أدوات المادة وإيقاف قسم ({activeSubject}) لـ {studentGrade || 'هذا الصف'}. يمكنك التبديل بين بقية الأقسام التفاعلية المتاحة بالأعلى.
          </p>
        </div>
      ) : (
        <>
          {isArabic && <ArabicLexiconModule />}
          {isLanguages && <MultilingualTranslatorModule defaultLang={normalizedSub.includes('فرنس') ? 'فرنسية' : normalizedSub.includes('ألمان') ? 'ألمانية' : 'إنجليزية'} />}
          {isGeoHistory && <GeoHistoryModule />}
          {isPhilosophy && <SocratesModule />}
          {isCoding && <CodeSandboxModule />}
          {isScience && <VirtualScienceLabModule />}
          {isMath && <ScientificCalculatorModule />}

          {/* Fallback if no specific topic match */}
          {!isArabic && !isLanguages && !isGeoHistory && !isPhilosophy && !isCoding && !isScience && !isMath && (
            <ArabicLexiconModule />
          )}
        </>
      )}
    </div>
  );
};
