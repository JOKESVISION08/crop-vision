import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, BookOpen, User, Bot, Loader2, ArrowRight } from 'lucide-react';
import { Farm, ChatMessage, KnowledgeSource, UserSettings } from '../types';
import { translations } from '../translations';

interface CropGPTChatViewProps {
  farm: Farm;
  knowledgeSources: KnowledgeSource[];
  settings: UserSettings;
}

export const CropGPTChatView: React.FC<CropGPTChatViewProps> = ({
  farm,
  knowledgeSources,
  settings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello! I am CropGPT, your expert agricultural AI assistant for **${farm.farm_name}** (${farm.crop_type}). I am grounded in ICAR and TNAU verified guidelines and your latest CropVision AI scans. How can I help you optimize your crop health today?`,
      timestamp: new Date().toISOString(),
      sources: ['src-icar-01']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[settings.language] || translations.en;

  const quickPrompts = [
    "What pest or disease is visible in my crop image?",
    "What changed since the last observation?",
    "Is the affected area increasing?",
    "What ICAR treatment is recommended?",
    "How can I prevent this problem from spreading?"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          farm_id: farm.farm_id,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data.reply]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="bg-emerald-700 p-2.5 rounded-2xl text-white shadow">
          <Sparkles className="h-6 w-6 text-emerald-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.chat}</h1>
          <p className="text-sm text-slate-500">Evidence-grounded RAG conversational assistant for {farm.farm_name}</p>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap border border-emerald-200 transition shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 min-h-[450px] max-h-[600px] overflow-y-auto space-y-6 flex flex-col">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isBot ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
              }`}>
                {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              <div className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                isBot ? 'bg-emerald-50/70 border border-emerald-100 text-slate-800' : 'bg-slate-900 text-white'
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* RAG Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center">
                      <BookOpen className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                      RAG Sources:
                    </span>
                    {msg.sources.map(srcId => {
                      const src = knowledgeSources.find(s => s.source_id === srcId);
                      return src ? (
                        <a
                          key={srcId}
                          href={src.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 font-semibold px-2 py-0.5 rounded-full transition"
                        >
                          {src.title.split(':')[0]}
                        </a>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-800 text-sm flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>CropGPT is searching verified RAG knowledge and observation history...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-200 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.ask_cropgpt}
          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-slate-800"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition shadow"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
