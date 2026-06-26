import { useQuery } from '@tanstack/react-query';
import { Send, MessageSquare, Bot, User, Trash2, Plus } from 'lucide-react';
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
    <div className="grid gap-8 lg:grid-cols-[340px_1fr] animate-fade-in p-4 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <aside className="glass-card flex flex-col !p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-500" />
              History
           </h2>
           <button 
             onClick={() => setChatMessages([{ role: 'assistant', content: 'Salutations! I am your career architect. Ask me anything about scaling your professional journey.' }])}
             className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-transform hover:rotate-90"
           >
              <Plus size={18} />
           </button>
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto modern-scrollbar pr-1">
          {(data?.chats || []).map((item) => (
            <button 
              key={item._id} 
              className="group flex items-center gap-3 w-full rounded-2xl p-4 text-left text-sm font-bold transition-all duration-300 bg-white/50 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="truncate flex-1 italic">{item.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="glass-card flex flex-col !p-0 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md z-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 animate-float">
                 <Bot size={26} />
              </div>
              <div>
                 <h1 className="text-xl font-black italic tracking-tight">Interview AI Assistant</h1>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Always Ready to Advise
                 </p>
              </div>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-slate-950/20 modern-scrollbar">
          {chatMessages.map((item, index) => (
            <div key={index} className={`flex items-start gap-4 ${item.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${item.role === 'user' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-indigo-600 text-white'}`}>
                  {item.role === 'user' ? <User size={20} /> : <Bot size={20} />}
               </div>
               <div className={`max-w-[75%] px-6 py-4 rounded-[2rem] text-sm font-semibold shadow-sm leading-relaxed ${
                 item.role === 'user' 
                 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-none italic' 
                 : item.content.startsWith('Error:') 
                   ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20 rounded-tl-none'
                   : 'bg-white text-slate-700 border border-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-white/5 shadow-xl shadow-indigo-500/5 rounded-tl-none'
               }`}>
                  {item.content}
               </div>
            </div>
          ))}
          {loading && (
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white animate-pulse">
                   <Bot size={20} />
                </div>
                <div className="bg-white/50 dark:bg-white/5 px-6 py-4 rounded-[2rem] rounded-tl-none animate-pulse italic text-xs font-bold text-slate-400 tracking-widest">
                   Architecting a response...
                </div>
             </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-white dark:bg-slate-900 z-10 border-t border-slate-100 dark:border-white/5">
          <div className="relative group">
            <input 
              className="input pr-16 !rounded-[2.5rem] !py-5 shadow-2xl shadow-indigo-500/5" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Inquire about roadmaps, coding strategy, or interviews..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSend();
              }} 
            />
            <button 
              disabled={!message.trim() || loading} 
              onClick={handleSend} 
              className="absolute right-2 top-2 bottom-2 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
