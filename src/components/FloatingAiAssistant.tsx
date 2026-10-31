import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Image as ImageIcon,
  Loader2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { db, auth } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface FloatingAiAssistantProps {
  role: 'student' | 'parent' | 'teacher';
  isExamActive?: boolean;
  studentName?: string;
}

interface Message {
  role: 'user' | 'model';
  parts: { text: string; inlineData?: any }[];
  groundingMetadata?: any;
  timestamp: string;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  role,
  isExamActive = false,
  studentName = ''
}) => {
  // Anti-cheat rule: hidden during active exam for students
  if (role === 'student' && isExamActive) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRobotTalking, setIsRobotTalking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (role !== 'student' || !auth.currentUser) return;
      const chatRef = doc(db, 'ai_chat_sessions', auth.currentUser.uid);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        setMessages(data.messages);
      }
    };
    loadChatHistory();
  }, [role, auth.currentUser]);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting =
        role === 'student'
          ? `مرحباً يا بطل ${studentName || ''}! أنا رفيقك الآلي الذكي (Cyber Robot Buddy) 🤖⚡\nأنظمتي التعليمية مستعدة للإعراب الفوري، شرح أي قاعدة نحوية أو بلاغية، وحل جميع أسئلتك المنهجية بدقة!`
          : role === 'parent'
          ? `أهلاً بك يا ولي الأمر الكريم! أنا مساعدك الروبوتي الذكي 🤖. كيف يمكنني مساعدتك في متابعة مستوى ابنك الدراسي وتقديم نصائح التفوق؟`
          : `أهلاً يا أستاذنا العزيز! أنا مساعدك الأكاديمي الرقمي 🤖 لمساعدتك في صياغة الأسئلة ونماذج الإجابة وتلخيص المحتوى.`;

      setMessages([
        {
          role: 'model',
          parts: [{ text: greeting }],
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [role, studentName]);

  const saveChatToFirestore = async (updatedMessages: Message[]) => {
    if (role !== 'student' || !auth.currentUser) return;
    const chatRef = doc(db, 'ai_chat_sessions', auth.currentUser.uid);
    await setDoc(chatRef, {
      studentId: auth.currentUser.uid,
      messages: updatedMessages.map(m => ({
        role: m.role,
        parts: m.parts.map(p => ({ text: p.text || '' })),
        timestamp: m.timestamp
      })),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const playBlipSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext may be restricted by browser policy
    }
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customPrompt || input).trim();
    if ((!textToSend && !selectedImage) || loading) return;

    playBlipSound();
    const currentText = textToSend;
    const currentImg = selectedImage;
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const userParts: any[] = [];
    if (currentImg) {
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: currentImg.split(',')[1]
        }
      });
    }
    if (currentText) {
      userParts.push({ text: currentText });
    }

    const newMessage: Message = {
      role: 'user',
      parts: userParts,
      timestamp
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setLoading(true);
    setIsRobotTalking(true);

    try {
      const endpoint = role === 'student' ? '/api/student/ai-chat' : `/api/${role}/ai-chat`;
      const history = newMessages.slice(-8).map((m) => ({
        role: m.role,
        parts: m.parts.map((p) => ({ text: p.text || '' }))
      }));

      const res = await apiRequest<any>(role, endpoint, {
        question: currentText,
        imageBase64: currentImg,
        history,
        isExamActive
      });

      const replyText = res.reply || res.answer || 'تمت معالجة سؤالك بنجاح!';
      const modelMessage: Message = {
        role: 'model',
        parts: [{ text: replyText }],
        groundingMetadata: res.groundingMetadata,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      
      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);
      await saveChatToFirestore(finalMessages);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'model',
        parts: [{ text: `عذراً، حدث خطأ أثناء المعالجة: ${err.message || 'يرجى المحاولة مجدداً'}` }],
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setLoading(false);
      setIsRobotTalking(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    if (window.confirm('هل تريد مسح سجل المحادثة والبدء من جديد؟')) {
      setMessages([]);
    }
  };

  // FLOATING ROBOT BUTTON (WHEN CLOSED)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(true);
            playBlipSound();
          }}
          className="relative group p-0 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer"
          title="افتح المساعد الروبوتي الذكي"
        >
          {/* Animated Halo Gradient Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 rounded-full blur-md opacity-80 group-hover:opacity-100 animate-spin [animation-duration:6s]" />

          {/* Robot Head Body */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#0e1d35] to-[#070d18] border-2 border-cyan-400 flex flex-col items-center justify-center overflow-hidden">
            
            {/* Robot Pulsing Antenna */}
            <div className="absolute top-1 flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-ping" />
              <div className="w-0.5 h-2 bg-cyan-400/80 -mt-1" />
            </div>

            {/* Glowing Eyes Visor */}
            <div className="mt-2.5 flex items-center gap-2 px-2.5 py-1 bg-black/60 rounded-full border border-cyan-500/40 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse delay-100" />
            </div>

            {/* Cyber Mouth Line / Voice Visualizer */}
            <div className="mt-1 flex items-center gap-0.5">
              <div className="w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <div className="w-1 h-2.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
              <div className="w-1 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>

          {/* Active Online Pulse Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#070d18] shadow-[0_0_8px_#34d399]" />
        </button>
      </div>
    );
  }

  // ROBOT CHAT MODAL
  return (
    <div
      dir="rtl"
      className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0b1424] border border-cyan-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden backdrop-blur-xl
        ${
          isMinimized
            ? 'bottom-6 right-6 w-80 h-16'
            : 'bottom-24 right-6 w-[430px] h-[640px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]'
        }`}
    >
      {/* ROBOT HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#0d1d38] via-[#09152a] to-[#0d1d38] border-b border-cyan-500/30 sticky top-0 z-20">
        
        {/* Animated Cyber Light Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Robot Brand & Avatar */}
        <div className="flex items-center gap-3">
          {/* Animated Mini Robot Head */}
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-[#112444] to-[#091322] border border-cyan-400/80 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            {/* Pulsing Mini Antenna */}
            <div className="absolute -top-1.5 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-ping" />
              <div className="w-0.5 h-1.5 bg-cyan-400" />
            </div>

            {/* Glowing Digital Eyes */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/70 rounded-full border border-cyan-500/30">
              <div className={`w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] ${isRobotTalking ? 'animate-ping' : 'animate-pulse'}`} />
              <div className={`w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] ${isRobotTalking ? 'animate-ping' : 'animate-pulse'}`} />
            </div>

            {/* Voice Grille */}
            <div className="mt-1 flex items-center gap-0.5">
              <div className="w-1 h-1 bg-emerald-400 rounded-full" />
              <div className="w-1 h-1.5 bg-cyan-400 rounded-full" />
              <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white tracking-wide">
                الروبوت التعليمي الذكي
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300 border border-cyan-400/40 rounded-full">
                يتعلم ذاتياً ⚡
              </span>
            </div>
            {!isMinimized && (
              <p className="text-[10px] font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>متصل بالبحث ومناهج الوزارة • فائق السرعة</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {!isMinimized && (
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              title="مسح المحادثة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title={isMinimized ? 'تكبير' : 'تصغير'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#091322] to-[#070e1c] scroll-smooth">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[92%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-cyan-900/30'
                      : 'bg-[#0f1d35] text-slate-100 border border-cyan-500/25 rounded-tl-none shadow-black/40'
                  }`}
                >
                  {/* Robot Header Tag on Model messages */}
                  {m.role === 'model' && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-cyan-500/15 text-[11px] font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>رد الروبوت الذكي:</span>
                      </div>
                      <button
                        onClick={() => handleCopy(m.parts.map((p) => p.text).join('\n'), i)}
                        className="opacity-70 hover:opacity-100 p-1 text-slate-400 hover:text-cyan-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[10px]"
                        title="نسخ الإجابة"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Parts */}
                  {m.parts.map((p, pi) => (
                    <div key={pi}>
                      {p.inlineData && (
                        <img
                          src={`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`}
                          className="rounded-xl mb-2 max-w-full border border-cyan-500/30"
                          alt="مرفق من المستخدم"
                        />
                      )}
                      {p.text && <p className="whitespace-pre-wrap font-medium">{p.text}</p>}
                    </div>
                  ))}

                  {/* Grounding Sources */}
                  {m.groundingMetadata?.searchEntryPoint && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/15 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold">
                        <Search className="w-3 h-3" />
                        <span>مصادر وبحوث معتمدة:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingMetadata.groundingChunks?.map((chunk: any, ci: number) =>
                          chunk.web?.uri ? (
                            <a
                              key={ci}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#091426] border border-cyan-500/20 rounded-md text-[10px] text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="max-w-[120px] truncate">
                                {chunk.web.title || 'مصدر خارجي'}
                              </span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  <span className="block text-[9px] mt-1.5 opacity-50 text-left font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator with Animated Robot Eyes */}
            {loading && (
              <div className="flex items-center gap-3 p-3.5 bg-[#0f1d35] border border-cyan-500/30 rounded-2xl w-fit shadow-lg animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-cyan-200">الروبوت يحلل ويعالج السؤال ذاتياً...</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] text-slate-400">مراجعة القواعد والتحقق من المنهج</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* COLORFUL QUICK SUGGESTION CHIPS REMOVED */}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => handleSend(e)}
            className="p-3 border-t border-cyan-500/25 bg-[#0a1528] relative"
          >
            {selectedImage && (
              <div className="relative inline-block mb-2 ml-2">
                <img
                  src={selectedImage}
                  className="w-14 h-14 object-cover rounded-xl border border-cyan-400/50 shadow-md"
                  alt="معاينة الصورة"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 rounded-xl transition-all cursor-pointer border border-transparent hover:border-cyan-500/30"
                title="إرفاق صورة سؤال أو كراسة"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسألني أي شيء، في المنهج أو خارجه..."
                className="flex-1 bg-[#0f1d35] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer"
                title="إرسال"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
