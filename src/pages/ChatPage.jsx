import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { askGroq } from '../lib/groq';
import Layout from '../components/Layout';

const SYSTEM_PROMPT = `You are AquaGuard AI, a water safety expert. Only answer water-related questions about contamination, purification, waterborne diseases, safe drinking practices, and conservation. Always structure your response with these labeled sections: Possible Cause, Safety Advice, Preventive Measures. Be clear and concise.`;

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chats').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setChatHistory(data || []);
      // Build messages from history
      const msgs = [];
      (data || []).forEach(chat => {
        msgs.push({ role: 'user', content: chat.question });
        msgs.push({ role: 'ai', content: chat.answer });
      });
      setMessages(msgs);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || isTyping) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsTyping(true);

    try {
      const answer = await askGroq(q, SYSTEM_PROMPT);
      setMessages(prev => [...prev, { role: 'ai', content: answer }]);
      // Save to DB
      const { error } = await supabase.from('chats').insert({
        user_id: user.id, question: q, answer,
      });
      if (error) console.error('Error saving chat:', error);
      setChatHistory(prev => [...prev, { question: q, answer, created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error('Groq error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const parseAIResponse = (content) => {
    // Simple section parser
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
      const headerMatch = line.match(/^\*\*(.+?)\*\*:?$|^#+\s*(.+)$|^(.+?):$/);
      if (headerMatch) {
        if (currentSection) sections.push({ title: currentSection, content: currentContent.join('\n') });
        currentSection = headerMatch[1] || headerMatch[2] || headerMatch[3];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    });
    if (currentSection) sections.push({ title: currentSection, content: currentContent.join('\n') });

    if (sections.length === 0) return <p className="font-body-md text-body-md whitespace-pre-wrap">{content}</p>;

    return (
      <div className="flex flex-col gap-3">
        {sections.map((s, i) => (
          <div key={i}>
            <h4 className="font-label-md text-label-md font-bold text-primary mb-1">{s.title}</h4>
            <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{s.content.trim()}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <main className="flex-grow flex justify-center w-full bg-surface">
        <div className="max-w-container-max w-full px-margin-x py-stack-lg flex flex-col md:flex-row gap-gutter h-[calc(100vh-160px)] min-h-[600px]">
          {/* Left: Chat History */}
          <aside className="hidden md:flex flex-col w-1/3 bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden border border-surface-variant">
            <div className="p-stack-md border-b border-surface-variant bg-surface-container-low">
              <h2 className="font-headline-md text-headline-md text-primary">Chat History</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Recent inquiries</p>
            </div>
            <div className="flex-grow overflow-y-auto chat-scroll p-stack-sm">
              <ul className="flex flex-col gap-2">
                {chatHistory.length === 0 ? (
                  <li className="p-3 text-center text-on-surface-variant font-label-sm text-label-sm">No conversations yet</li>
                ) : (
                  chatHistory.map((chat, i) => (
                    <li key={i}>
                      <div className="w-full text-left p-3 rounded-lg hover:bg-surface-variant transition-colors group flex items-start gap-3">
                        <span className="material-symbols-outlined text-outline mt-0.5 group-hover:text-secondary transition-colors">history</span>
                        <div>
                          <p className="font-body-md text-body-md text-on-surface line-clamp-1">{chat.question}</p>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {new Date(chat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="p-stack-md border-t border-surface-variant">
              <button className="w-full py-2 border border-[#0ea5e9]/20 rounded-lg text-secondary font-label-md text-label-md hover:bg-surface-container transition-colors flex justify-center items-center gap-2" onClick={() => { setMessages([]); }}>
                <span className="material-symbols-outlined text-[20px]">add</span> New Chat
              </button>
            </div>
          </aside>

          {/* Right: Chat Interface */}
          <section className="flex flex-col w-full md:w-2/3 bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden relative border border-surface-variant">
            <div className="bg-surface-container py-3 px-stack-md border-b border-surface-variant flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-secondary">smart_toy</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Powered by Llama 3 — Water Safety Expert</span>
            </div>

            <div className="flex-grow overflow-y-auto chat-scroll p-stack-md flex flex-col gap-6" id="chat-container">
              {/* AI Greeting */}
              <div className="flex items-start gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                </div>
                <div className="bg-surface p-4 rounded-2xl rounded-tl-sm border border-surface-variant shadow-sm text-on-surface">
                  <p className="font-body-md text-body-md">Hello! I am your AquaGuard AI Assistant. How can I help you analyze your water safety today?</p>
                </div>
              </div>

              {/* Messages */}
              {messages.map((msg, i) => msg.role === 'user' ? (
                <div key={i} className="flex items-end gap-4 max-w-[85%] self-end flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary text-[20px]">person</span>
                  </div>
                  <div className="bg-[#06b6d4] text-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                    <p className="font-body-md text-body-md">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-4 max-w-[90%]">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                  </div>
                  <div className="bg-surface p-5 rounded-2xl rounded-tl-sm border border-surface-variant shadow-sm text-on-surface">
                    {parseAIResponse(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                  </div>
                  <div className="bg-surface p-4 rounded-2xl rounded-tl-sm border border-surface-variant shadow-sm text-on-surface flex items-center gap-1 h-12">
                    <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-stack-md bg-surface-container-lowest border-t border-surface-variant">
              <form className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-[#0ea5e9]/20 focus-within:border-[#0ea5e9] focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 transition-all shadow-inner" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <button aria-label="Attach file" className="p-2 text-outline hover:text-secondary transition-colors" type="button">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input aria-label="Chat input" className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline p-2" placeholder="Ask about water safety, test results, or report symptoms..." type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                <button aria-label="Send message" className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white p-2 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2" type="submit">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
              <p className="text-center font-label-sm text-label-sm text-outline mt-2">AI-generated information is for guidance. Always consult official municipal alerts for urgent safety notices.</p>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
