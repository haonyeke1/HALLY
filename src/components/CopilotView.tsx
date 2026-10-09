import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Shield,
  Bot,
  User,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { CopilotMessage, BusinessProfile } from '../types';

interface CopilotViewProps {
  business: BusinessProfile;
  messages: CopilotMessage[];
  onSendMessage: (msg: CopilotMessage) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  business,
  messages,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How do I verify if an urgent vendor bank account update is legitimate?',
    'What should I look for before signing a commercial vendor contract?',
    'A client is 18 days overdue claiming they sent ACH. What steps should I take?',
    'Give me a 5-step checklist to protect our client files and banking logins.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text,
      createdAt: 'Just now',
    };
    onSendMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.chatCopilot({
        message: text,
        history: messages,
        businessContext: business,
      });

      const assistantMsg: CopilotMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: res.reply,
        createdAt: 'Just now',
      };
      onSendMessage(assistantMsg);
    } catch (err) {
      console.error(err);
      onSendMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: 'Guardian Copilot notice: For any suspicious wire transfer instructions or sudden payment changes, always contact the supplier directly at their known phone number before releasing funds.',
        createdAt: 'Just now',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4.5 mb-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">Guardian AI Copilot</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personal AI business protection advisor for {business.name}
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400 hidden sm:block">
          <span>Trained on fraud patterns, contract traps, & compliance</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="grow bg-white rounded-2xl border border-slate-200 p-4.5 overflow-y-auto space-y-4 shadow-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                How can Guardian protect your business today?
              </h3>
              <p className="text-xs text-slate-500">
                Ask anything about suspicious emails, vendor agreements, overdue invoice recovery, or fraud prevention.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="w-full space-y-2 pt-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Prompts:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-xs text-slate-700 text-left transition-all"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 space-y-1.5 shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                    <span className="font-bold">{isUser ? 'You' : 'Guardian Copilot'}</span>
                    <span>{msg.createdAt}</span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-[10px] text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {business.ownerName.slice(0, 1)}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="italic">Guardian Copilot is formulating advice...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-center gap-2 bg-white rounded-2xl border border-slate-300 p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Guardian about a suspicious email, contract terms, or cashflow risk..."
          className="grow px-3 py-2 text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
