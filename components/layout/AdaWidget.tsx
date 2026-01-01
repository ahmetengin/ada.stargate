
import React, { useState } from 'react';
import { MessageSquare, X, Send, Activity } from 'lucide-react';

export const AdaWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'ada', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isTalking, setIsTalking] = useState(false);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setIsTalking(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ada', text: "Thank you for contacting WIM. How can I assist you further?" }]);
            setIsTalking(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {isOpen && (
                <div className="bg-white dark:bg-zinc-900 w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-10 duration-300">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="font-bold">Ada AI</span></div>
                        <button onClick={() => setIsOpen(false)}><X size={18}/></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50 dark:bg-black/20 text-xs">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 border'}`}>{m.text}</div>
                            </div>
                        ))}
                        {isTalking && <div className="text-zinc-400 italic"><Activity size={12} className="inline animate-spin mr-1"/>Thinking...</div>}
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 border-t flex gap-2">
                        <input className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-2 text-xs outline-none" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}/>
                        <button onClick={sendMessage} className="p-2 bg-indigo-600 rounded-full text-white"><Send size={14}/></button>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};
