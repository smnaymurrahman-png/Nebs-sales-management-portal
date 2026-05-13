'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How do I approach a new Blaster client?',
  'Write a WhatsApp message to follow up with a reseller',
  'Tips for growing a Facebook group quickly',
  'How to handle a client who wants to reduce quantity?',
];

export default function NebsSellerProPage() {
  const token = useAuthStore(s => s.token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(msgs => [...msgs, assistantMsg]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages(msgs => {
                const updated = [...msgs];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: updated[updated.length - 1].content + parsed.text };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: 'Sorry, something went wrong. Please try again.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Nebs-Seller Pro" subtitle="AI-powered sales assistant"
        actions={messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 text-sm rounded-xl transition-colors">
            <Trash2 size={14} /> Clear
          </button>
        )} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto pt-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Bot size={32} className="text-gray-900" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Nebs-Seller Pro</h2>
              <p className="text-gray-500 text-sm">Your AI sales mentor. Ask anything about clients, marketing, and sales strategies.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="p-3 bg-white border border-gray-200 hover:border-green-500/40 hover:bg-gray-100 rounded-xl text-left text-sm text-gray-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3 max-w-3xl', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
              msg.role === 'assistant' ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gray-200')}>
              {msg.role === 'assistant' ? <Bot size={16} className="text-gray-900" /> : <User size={16} className="text-gray-600" />}
            </div>
            <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%]',
              msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700')}>
              {msg.content || (msg.role === 'assistant' && loading && i === messages.length - 1 ? (
                <span className="flex items-center gap-2 text-gray-500"><Loader2 size={14} className="animate-spin" /> Thinking...</span>
              ) : null)}
              {msg.role === 'assistant' && msg.content && (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
              {msg.role === 'user' && msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Nebs-Seller Pro anything..."
            rows={1}
            className="flex-1 bg-white border border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none transition-colors"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
