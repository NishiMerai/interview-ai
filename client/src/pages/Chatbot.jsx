import { useQuery } from '@tanstack/react-query';
import { Send, MessageSquare, Bot, User, Plus } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api.js';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Salutations! I am your career architect. Ask me anything about scaling your professional journey.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        return (await api.get('/chats')).data;
      } catch {
        return { chats: [] };
      }
    }
  });

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setError('');

    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await api.post('/chat', { message: userMsg });
      const answer = response.data?.answer;

      if (!answer) {
        throw new Error('No answer received from AI');
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr] animate-fade-in p-2 md:p-4 h-[calc(100vh-8rem)] max-w-[1600px] mx-auto">
      {/* Sidebar for chat archives */}
      <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-soft">
        <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              Chat Log Files
            </h2>
            <button 
              onClick={() => setChatMessages([{ role: 'assistant', content: 'Salutations! I am your career architect. Ask me anything about scaling your professional journey.' }])}
              className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/10 hover:bg-blue-700 transition"
              title="Reset Chat Session"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto modern-scrollbar pr-1 text-xs">
            {(data?.chats || []).length === 0 ? (
              <p className="text-slate-400 italic text-[11px] font-semibold">No historical logs.</p>
            ) : (
              (data?.chats || []).map((item) => (
                <button 
                  key={item._id} 
                  className="flex items-center gap-2.5 w-full rounded-lg p-2.5 text-left font-bold transition duration-300 border border-slate-100 hover:border-slate-250 hover:bg-slate-50/50 dark:border-slate-800/80 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="truncate flex-1">{item.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-soft relative">
        {/* Chat Area Header */}
        <div className="p-5 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between z-10 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">Career Copilot</h1>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Response Grid
              </p>
            </div>
          </div>
        </div>

        {/* Dialog Bubbles list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]/50 dark:bg-slate-950/20 modern-scrollbar">
          {chatMessages.map((item, index) => (
            <div key={index} className={`flex items-start gap-3.5 ${item.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 font-bold text-xs border
                ${item.role === 'user' 
                  ? 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' 
                  : 'bg-primary text-white border-blue-600'
                }
              `}>
                {item.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`
                max-w-[80%] px-5 py-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm
                ${item.role === 'user' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-none' 
                  : item.content.startsWith('Error:') 
                    ? 'bg-rose-50/50 text-red-650 border border-rose-100 dark:bg-rose-950/15 dark:text-red-400 dark:border-rose-900/20 rounded-tl-none'
                    : 'bg-white text-slate-700 border border-slate-150 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 rounded-tl-none'
                }
              `}>
                {item.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 px-5 py-3.5 rounded-2xl rounded-tl-none animate-pulse text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Compiling response...
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="p-5 border-t border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="relative group">
            <input 
              className="input pr-14 !rounded-xl !py-4 shadow-sm text-xs" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Ask me anything about resumes, roadmaps, or interview prep..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSend();
              }} 
            />
            <button 
              disabled={!message.trim() || loading} 
              onClick={handleSend} 
              className="absolute right-2 top-2 bottom-2 w-10 rounded-lg bg-primary text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
