import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const AskInsightClass: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_API_BASE_URL}/ai/chat`
    })
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;
    sendMessage({ text: input });
    setInput('');
  };

  const getMessageText = (message: any): string => {
    let fullText = message.content || '';
    const parts = message.parts || [];
    if (parts.length > 0) {
      fullText = parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }
    return fullText;
  };

  const isGenerating = status === 'submitted' || status === 'streaming';

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="mb-6 w-[380px] md:w-[480px] bg-card rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden flex flex-col ring-1 ring-border/50"
            style={{ maxHeight: '650px' }}
          >
            {/* Header */}
            <div className="bg-sidebar pt-8 pb-6 px-6 text-sidebar-foreground flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-[1rem] shadow-lg shadow-primary/30">
                  <Sparkles size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Ask InsightClass</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Teaching Copilot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto min-h-[350px] bg-card" ref={scrollRef}>
              <div className="bg-muted/30 border border-border p-4 rounded-[1.5rem] mb-8 text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
                  Contextual Assistance
                </p>
                <p className="text-sm text-foreground/80 font-semibold leading-relaxed">
                  Ask about class learning patterns, risk levels, or specific student trends.
                </p>
              </div>

              <div className="space-y-6">
                {messages.filter(m => m.role !== 'system').map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[88%] p-4 rounded-[1.5rem] text-[14px] leading-relaxed font-medium shadow-sm border ${m.role === 'user' 
                          ? 'bg-primary text-primary-foreground border-primary/50 rounded-tr-none shadow-primary/10' 
                          : 'bg-muted/50 border-border text-foreground/90 rounded-tl-none'
                      }`}
                      dangerouslySetInnerHTML={m.role === 'assistant' ? { 
                        __html: getMessageText(m)
                          .replace(/\*\*/g, '') 
                          .replace(/\*/g, '')   
                          .replace(/_/g, '')    
                          .replace(/\n/g, '<br />') 
                      } : undefined}
                    >
                      {m.role === 'user' ? getMessageText(m) : null}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 border border-border p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                      <span className="text-[13px] text-muted-foreground font-bold italic">Analyzing insights...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-[1.5rem] text-[13px] text-destructive font-bold flex flex-col gap-2">
                    <p>Encountered a temporary analysis error. Please retry in a moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-6 bg-card border-t border-border/50">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your classroom..."
                  disabled={status !== 'ready'}
                  className="w-full pl-6 pr-14 py-4 bg-muted/30 border border-border rounded-[1.25rem] text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-card outline-none shadow-inner disabled:opacity-50 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={status !== 'ready' || !input.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-primary-foreground rounded-[1rem] hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  AI Guidance Engine Active
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-8 py-5 bg-sidebar text-sidebar-foreground rounded-[2rem] shadow-2xl border border-border hover:shadow-primary/10 transition-all group ring-4 ring-background"
      >
        <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary/30">
          <MessageSquare size={20} fill="currentColor" className="text-primary-foreground" />
        </div>
        <span className="font-black text-sm tracking-tight uppercase tracking-widest">Ask InsightClass</span>
      </motion.button>
    </div>
  );
};

export default AskInsightClass;