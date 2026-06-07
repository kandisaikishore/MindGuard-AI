import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ShieldAlert, Heart, User, Compass, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AiAssistantProps {
  onSendMessage: (message: string) => Promise<string>;
}

export default function AiAssistant({ onSendMessage }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "ai_init",
      sender: "ai",
      text: "Hello! welcome. I am MindGuard AI, your virtual mental health grounding peer. I am here to help you practice deep breathing, offer immediate stress management guides, or suggest sleep improvements.\n\n⚠️ Important Notice: I am an automated support tool, not a licensed medical professional, nurse, or psychiatrist. If you are experiencing a mental health crisis, please click the emergency red SOS button or dial 988 immediately.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const replyText = await onSendMessage(userMsg.text);
      const aiReply: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const errorReply: Message = {
        id: `ai_err_${Date.now()}`,
        sender: "ai",
        text: "MindGuard AI is experiencing a network bottleneck. If you feel stressed, take a deep box breath (inhale for 4 seconds, hold for 4, exhale for 4) or trigger our SOS emergency message.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col h-[560px] justify-between">
      {/* Header and Disclaimer warning banner */}
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-slate-900 text-base">MindGuard AI Grounding Peer</h3>
        </div>
        <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold letter spacing tracking-wider flex items-center gap-1">
          <LockIcon />
          E2E Secure Session Compliance
        </span>
      </div>

      {/* Messages Scrolling Arena */}
      <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 min-h-0 bg-slate-50/50 rounded-xl p-4 border border-slate-150">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'ml-auto flex-row-reverse'}`}>
              <div className={`p-2 rounded-xl mt-1 shrink-0 h-8 w-8 flex items-center justify-center border font-bold text-xs ${
                isAi ? 'bg-teal-50 text-teal-700 border-teal-150' : 'bg-slate-900 text-white border-slate-900'
              }`}>
                {isAi ? "MG" : "P"}
              </div>
              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 whitespace-pre-line ${
                isAi 
                  ? 'bg-white border-slate-150 text-slate-800 rounded-tl-none' 
                  : 'bg-teal-650 hover:bg-teal-700 text-white border-teal-600 rounded-tr-none'
              }`}>
                <p>{m.text}</p>
                <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">
                  {m.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="bg-teal-50 text-teal-700 border border-teal-150 rounded-xl p-2 shrink-0 h-8 w-8 flex items-center justify-center font-bold text-xs">
              MG
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-450 italic flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span>MindGuard is reasoning...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSend} className="flex gap-2 relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here to chat (e.g. 'How should I practice box breathing' or 'I feel energetic')..."
          className="flex-1 text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition pr-10"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bg-teal-600 p-2 hover:bg-teal-700 text-white rounded-lg transition shrink-0 cursor-pointer"
          disabled={loading || !inputText.trim()}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
