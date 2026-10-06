/** Answers questions using facts recorded in the portfolio. */

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, AlertCircle, CornerDownLeft } from 'lucide-react';
import { soundManager } from '../audio/soundManager.ts';

interface AskPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'What does ExplainAI check before answering?',
  'What technologies are listed for KaziLink?',
  'What does the AWS compliance checker do?',
  'What education is listed in the portfolio?',
];

export function AskPortfolioModal({ isOpen, onClose }: AskPortfolioModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'agent',
      text: "Ask about the projects, technologies, or contact details listed in this portfolio. Answers are selected directly from its structured content; if something is not recorded, I will say so.",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || input;
    if (!query.trim() || loading) return;

    soundManager.playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      if (!response.ok) {
        throw new Error(`Portfolio assistant request failed with status ${response.status}`);
      }

      const data = await response.json();
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.answer || "I don't have that on record for Tafadzwa.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('Unable to reach portfolio assistant:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: "I couldn't reach the portfolio data service just now. Please try again later.",
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl h-[600px] max-h-[calc(100dvh-2rem)] flex flex-col bg-[#080c14] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-assistant-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#060a10]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="portfolio-assistant-title" className="font-display font-bold text-white text-sm">Ask My Portfolio</h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  PORTFOLIO DATA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Answers drawn from portfolio content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close portfolio assistant"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
          <span className="text-slate-500 shrink-0">Try asking:</span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3.5 rounded-lg leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 font-mono">
              <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Consulting portfolio knowledge base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#060a10]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a project, its stack, or contact details..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Send</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
