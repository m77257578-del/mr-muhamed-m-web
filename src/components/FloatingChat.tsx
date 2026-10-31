import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { apiRequest, tokens } from '../services/api';
import { StudentProfile, ParentData } from '../types';

interface FloatingChatProps {
  studentProfile?: StudentProfile;
  parentData?: ParentData | null;
  onRefreshParent?: () => Promise<void>;
}

interface ChatMessage {
  id: string;
  name?: string;
  senderName?: string;
  senderRole?: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  reply?: string;
  created: string;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  studentProfile,
  parentData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states for guest / initial user
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'طالب' | 'ولي أمر'>('طالب');
  const [text, setText] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill if student or parent is logged in
  useEffect(() => {
    if (studentProfile) {
      setName(studentProfile.name || '');
      setPhone(studentProfile.phone || '');
      setRole('طالب');
    } else if (parentData) {
      setName(parentData.name || '');
      setRole('ولي أمر');
    } else {
      try {
        const savedName = localStorage.getItem('chat_sender_name');
        const savedPhone = localStorage.getItem('chat_sender_phone');
        if (savedName) setName(savedName);
        if (savedPhone) setPhone(savedPhone);
      } catch {}
    }
  }, [studentProfile, parentData]);

  // Load conversation messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const currentPhone = phone || studentProfile?.phone || '';
      const params = new URLSearchParams();
      if (currentPhone) params.append('phone', currentPhone);
      if (studentProfile?.code) params.append('studentId', studentProfile.code);

      const res = await apiRequest<{ messages: ChatMessage[] }>(
        'public',
        `/api/support/messages?${params.toString()}`
      );
      if (res && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (e) {
      // ignore silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, phone, studentProfile]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent, fileData?: { fileUrl: string; fileName: string }) => {
    if (e) e.preventDefault();
    if (!text.trim() && !fileData) return;

    setSending(true);
    try {
      if (!studentProfile && !parentData) {
        try {
          if (name) localStorage.setItem('chat_sender_name', name);
          if (phone) localStorage.setItem('chat_sender_phone', phone);
        } catch {}
      }

      await apiRequest('public', '/api/support/message', {
        name: name || (studentProfile?.name || 'طالب'),
        phone: phone || (studentProfile?.phone || ''),
        role: studentProfile ? 'طالب' : parentData ? 'ولي أمر' : role,
        text: text.trim() || (fileData ? `مرفق: ${fileData.fileName}` : ''),
        fileUrl: fileData?.fileUrl || '',
        fileName: fileData?.fileName || '',
      });

      setText('');
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      await loadMessages();
    } catch (err: any) {
      alert(err.message || 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل رفع الملف');

      await handleSend({ preventDefault: () => {} } as any, {
        fileUrl: data.url,
        fileName: file.name,
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err.message || 'تعذر رفع الملف');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 left-5 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="مراسلة المعلم والإدارة"
          className="relative group flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-cyan-600 to-cyan-400 text-white shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070d19] animate-pulse" />
        </button>
      </div>

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="fixed bottom-22 left-5 z-50 w-[92vw] sm:w-[380px] h-[520px] rounded-3xl bg-[#0c1626] border border-cyan-500/35 shadow-2xl flex flex-col overflow-hidden text-right animate-scale-up" dir="rtl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900/80 via-[#0f1b2d] to-cyan-950/80 border-b border-cyan-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">رسائل الدعم الفني والمعلم</h3>
                <p className="text-[10px] text-cyan-300/80 font-bold">متصل الآن • أرسل صور أو ملفات</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#08101e]/60 text-xs">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-slate-300 text-[11px] leading-relaxed">
              <span className="font-bold text-cyan-300">أهلاً بك!</span> يمكنك إرسال استفسارك أو إرفاق صور وواجبات وملفات مباشرة للمعلم والأدمن هنا.
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                {loading ? 'جاري تحميل الرسائل...' : 'لا توجد رسائل سابقة حتى الآن. ابدأ بكتابة رسالتك أدناه!'}
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="space-y-2">
                  <div className="flex flex-col items-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#12243d] border border-blue-500/25 p-2.5 text-slate-200">
                      <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-bold mb-1">
                        <User className="w-3 h-3" />
                        <span>{m.senderName || m.name || 'أنت'}</span>
                        <span className="text-slate-400 font-normal">
                          {new Date(m.created).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>

                      {/* File or Image Attachment */}
                      {m.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-blue-500/25">
                          {/\.(?:png|jpe?g|gif|webp)$/i.test(m.fileUrl) ? (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer">
                              <img
                                src={m.fileUrl}
                                alt={m.fileName || 'مرفق'}
                                className="rounded-xl max-h-44 w-full object-cover border border-cyan-500/40 hover:opacity-95 transition-opacity shadow-md"
                              />
                            </a>
                          ) : (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{m.fileName || 'تحميل الملف المرفق'}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {m.reply && m.reply.trim().length > 0 && (
                    <div className="flex flex-col items-end">
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-gradient-to-r from-emerald-950/70 to-[#0e2729] border border-emerald-500/35 p-2.5 text-emerald-100 shadow-md">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>رد المعلم (الأدمن):</span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {sendSuccess && (
            <div className="px-3 py-1.5 bg-emerald-950/80 border-t border-emerald-500/40 text-emerald-300 text-[11px] font-bold text-center">
              ✓ تم إرسال رسالتك أو ملفك للمعلم بنجاح!
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => handleSend(e)}
            className="p-3 bg-[#0a1424] border-t border-blue-500/20 space-y-2"
          >
            {!studentProfile && !parentData && (
              <div className="grid grid-cols-2 gap-2 pb-1">
                <input
                  type="text"
                  required
                  placeholder="اسمك بالكامل"
                  className="input-field text-xs py-1.5 px-2.5 bg-[#070e1a] border-blue-500/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="text"
                  dir="ltr"
                  required
                  placeholder="رقم الهاتف للتواصل"
                  className="input-field text-xs py-1.5 px-2.5 bg-[#070e1a] border-blue-500/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || sending}
                className="p-2.5 rounded-xl bg-[#12243d] text-cyan-300 hover:text-white hover:bg-cyan-600/30 border border-cyan-500/30 transition-all cursor-pointer h-[52px] flex items-center justify-center shrink-0"
                title="إرفاق صورة أو ملف"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                rows={2}
                placeholder={uploadingFile ? 'جاري رفع الملف...' : 'اكتب رسالتك أو أرفق صورة/ملف...'}
                className="input-field flex-1 text-xs py-2 px-2.5 bg-[#070e1a] border-blue-500/30 resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || uploadingFile || !text.trim()}
                className="btn-primary py-2.5 px-3.5 rounded-xl flex items-center justify-center disabled:opacity-50 cursor-pointer h-[52px] shrink-0"
                title="إرسال"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
