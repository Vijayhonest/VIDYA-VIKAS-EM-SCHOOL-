import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Phone,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { sendChatMessage, ChatMessage, ChatAction } from '../../services/aiService';

interface AiSchoolAssistantProps {
  onNavigate: (tab: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'How to apply for 2026–27 admission?',
  'Which classes are offered?',
  'What documents are needed for admission?',
  'What are the school office hours?',
  'Where is the school located?',
  'Show me the latest notices',
  'Where can I download the prospectus?',
];

export function AiSchoolAssistant({ onNavigate }: AiSchoolAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Namaste! Welcome to Vidya Vikas EM School. I am the school’s official AI assistant. How can I help you today with admissions, campus details, circulars, or academic information?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'navigate', label: 'Admission Enquiry', tab: 'admissions' },
        { type: 'navigate', label: 'Downloads & Prospectus', tab: 'downloads' },
        { type: 'call', label: 'Call Office: 9441971531', phone: '9441971531' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Build chat history
    const history = messages.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      text: m.text,
    }));

    try {
      const response = await sendChatMessage(textToSend, history);
      const assistantMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting AI reply:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          text: 'AI Assistant is temporarily unavailable. Please contact Vidya Vikas EM School at 9441971531.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'call', label: 'Call 9441971531', phone: '9441971531' },
            { type: 'navigate', label: 'Admission Enquiry', tab: 'admissions' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: 'Conversation reset. How can I help you with Vidya Vikas EM School information today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'navigate', label: 'Admission Enquiry', tab: 'admissions' },
          { type: 'call', label: 'Call Office: 9441971531', phone: '9441971531' },
        ],
      },
    ]);
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'call' && action.phone) {
      window.location.href = `tel:${action.phone}`;
    } else if (action.type === 'navigate' && action.tab) {
      onNavigate(action.tab);
      // On mobile screens, collapse the chatbot so the user sees the navigated page
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="ai-school-assistant-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open Vidya Vikas School AI Assistant"
          className="fixed bottom-18 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-blue-950 text-white shadow-xl hover:bg-blue-900 active:scale-95 transition-all duration-200 border-2 border-amber-400/80 group"
        >
          <div className="relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-950 animate-pulse" />
          </div>
          <div className="text-left hidden xs:block sm:block">
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <span>Ask School AI</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
            </div>
            <div className="text-[10px] text-blue-200 font-medium">Admissions & Info Desk</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="ai-school-assistant-window"
          className="fixed bottom-16 right-2.5 left-2.5 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[410px] h-[530px] max-h-[78vh] sm:max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-labelledby="ai-assistant-title"
        >
          {/* Header */}
          <div className="bg-blue-950 text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-blue-900/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 id="ai-assistant-title" className="text-xs sm:text-sm font-black font-heading tracking-wide text-white flex items-center gap-1.5">
                  <span>Vidya Vikas AI</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Official
                  </span>
                </h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admissions & Public Info</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                aria-label="Minimize assistant"
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy & Grounding Notice Bar */}
          <div className="bg-amber-50/90 border-b border-amber-200/60 px-3 py-1.5 flex items-center gap-1.5 text-[10.5px] text-amber-900 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">Answers grounded in verified school data • Helpline: 9441971531</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[9.5px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Smart Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200/80 font-bold text-[10.5px] transition-colors"
                      >
                        {act.type === 'call' ? (
                          <Phone className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 rounded-2xl px-3.5 py-2 w-fit rounded-bl-xs shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-900" />
                <span className="text-[11px] font-medium text-slate-600">Consulting school records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Quick:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-[10.5px] font-medium transition-colors border border-slate-200/60 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about admissions, campus, notices..."
              disabled={isLoading}
              maxLength={400}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-blue-950 text-white hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
