import React, { useState, useRef, useEffect } from 'react';
import { InsightMessage, StandupEntry } from '../types';
import { queryStandupInsights } from '../services/geminiService';
import { Search, Send, Database, Loader2 } from 'lucide-react';

interface InsightsProps {
  historyEntries: StandupEntry[];
}

const Insights: React.FC<InsightsProps> = ({ historyEntries }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<InsightMessage[]>([
    { role: 'assistant', content: 'Hello! I have access to the standup history vector database. Ask me anything like "What was the primary bottleneck last week?"', timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: InsightMessage = { role: 'user', content: query, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    const answer = await queryStandupInsights(historyEntries, userMsg.content);

    const botMsg: InsightMessage = { role: 'assistant', content: answer, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-t-xl shadow-sm border border-slate-200 p-4 border-b-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">Standup Memory (Vector DB)</h2>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
             {historyEntries.length} Records Indexed
          </span>
      </div>

      <div className="flex-1 bg-slate-50 border-x border-slate-200 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400">Querying semantic vectors...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about team progress, recurring blockers, or user status..."
            className="w-full pl-4 pr-12 py-3 bg-slate-950 text-slate-100 border border-slate-800 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Insights;