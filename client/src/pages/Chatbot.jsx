import { useMutation, useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api.js';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const { data, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => (await api.get('/chats')).data
  });

  const sendMutation = useMutation({
    mutationFn: async () => (await api.post('/chats/message', { chatId: activeChat?._id, message })).data,
    onSuccess: (data) => {
      setActiveChat(data.chat);
      setMessage('');
      refetch();
    }
  });

  const chat = activeChat || data?.chats?.[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="glass rounded-3xl p-4">
        <h1 className="text-xl font-black">Saved Chats</h1>
        <div className="mt-4 space-y-2">
          {(data?.chats || []).map((item) => (
            <button key={item._id} onClick={() => setActiveChat(item)} className="w-full rounded-2xl bg-white/70 p-3 text-left text-sm font-semibold dark:bg-white/10">
              {item.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="glass flex min-h-[75vh] flex-col rounded-3xl p-4">
        <div>
          <h1 className="text-3xl font-black">AI Career Chatbot</h1>
          <p className="text-sm text-slate-500">Ask resume, placement, coding, or interview questions.</p>
        </div>
        <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-3xl bg-white/50 p-4 dark:bg-slate-950/40">
          {(chat?.messages || [{ role: 'assistant', content: 'Hi! Ask me anything about your placement preparation.' }]).map((item, index) => (
            <div key={index} className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${item.role === 'user' ? 'ml-auto bg-brand-600 text-white' : 'bg-white text-slate-700 dark:bg-white/10 dark:text-slate-100'}`}>
              {item.content}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask Interview AI..." onKeyDown={(e) => {
            if (e.key === 'Enter' && message.trim()) sendMutation.mutate();
          }} />
          <button disabled={!message.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate()} className="btn-primary px-4">
            <Send size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
