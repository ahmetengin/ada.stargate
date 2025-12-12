import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Activity } from 'lucide-react';

export const AdaWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'ada', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isTalking, setIsTalking] = useState(false);

    useEffect(() => {
        if (isOpen && !ws) {
            // Connect to Go Gateway
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const socket = new WebSocket(`${protocol}//${window.location.host}/ws/`);
            
            socket.onopen = () => {
                // Send Guest Auth (or Token if logged in)
                socket.send(JSON.stringify({ type: 'auth', payload: 'guest-token' }));
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'response') {
                    setMessages(prev => [...prev, { role: 'ada', text: data.payload }]);
                    setIsTalking(false);
                }
            };

            setWs(socket);
        }
    }, [isOpen]);

    const sendMessage = () => {
        if (!input.trim() || !ws) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        ws.send(JSON.stringify({ type: 'text', payload: input }));
        setInput('');
        setIsTalking(true);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-zinc-900 w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="font-bold tracking-wide">Ada Marina AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X size={18}/></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50 dark:bg-black/20">
                        {messages.length === 0 && (
                            <div className="text-center text-xs text-zinc-500 mt-10">
                                <p>Welcome to West Istanbul Marina.</p>
                                <p>How can I assist you today?</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-bl-none text-zinc-800 dark:text-zinc-200'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTalking && (
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                                <Activity size={12} className="animate-spin" /> Ada is thinking...
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                        <input 
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Type or speak..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors">
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};