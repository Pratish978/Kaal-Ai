"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { supabase } from "@/app/utils/supabase";
import { BookOpen, Calendar, ChevronRight, AlertCircle } from "lucide-react";

interface Message {
  role: string;
  text: string;
}

interface SavedConversation {
  id: string;
  date: string;
  lastMessage: string;
  messages: Message[];
}

export default function HistoryPage() {
  const [selectedChat, setSelectedChat] = useState<SavedConversation | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        // 1. Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setErrorMessage("Please log in to view your history.");
          setLoading(false);
          return;
        }

        // 2. Fetch conversations
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          // Detailed logging to solve the "{}" error
          console.error("Supabase Database Error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setErrorMessage(`Database error: ${error.message}`);
          return;
        }

        if (data) {
          const formatted: SavedConversation[] = data.map(item => ({
            id: item.session_id || item.id,
            date: new Date(item.updated_at).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            }),
            lastMessage: item.last_message || "No message content",
            messages: Array.isArray(item.messages) ? item.messages : []
          }));
          setConversations(formatted);
        }
      } catch (err) {
        console.error("Unexpected Application Error:", err);
        setErrorMessage("An unexpected error occurred while loading history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col">
      <Navbar/>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-16 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Your conversations</h1>
          <p className="text-gray-500 text-sm">A private space to revisit your past reflections.</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Recent conversations</p>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/50 rounded-[24px]" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-gray-200 rounded-[24px] opacity-60">
                <p className="text-gray-400 text-xs italic">No conversations found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {conversations.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`group w-full text-left p-5 rounded-[24px] transition-all border ${
                      selectedChat?.id === chat.id 
                        ? "bg-white border-[#E9B87D] shadow-md scale-[1.02]" 
                        : "bg-transparent border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="max-w-[80%]">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{chat.date}</h3>
                        <p className="text-xs text-gray-400 truncate italic">{chat.lastMessage}</p>
                      </div>
                      <ChevronRight size={16} className={`text-gray-300 transition-transform ${selectedChat?.id === chat.id ? "rotate-90 text-[#E9B87D]" : ""}`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main View */}
          <div className="flex-1 min-h-[60vh] bg-white/50 border border-gray-100 rounded-[40px] p-8 md:p-12 relative overflow-y-auto max-h-[80vh] no-scrollbar">
            {selectedChat ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6 text-[#E9B87D] font-bold text-[10px] tracking-widest">
                  <Calendar size={14} /> SESSION LOG
                </div>
                <h2 className="text-3xl font-serif text-gray-800 mb-10">{selectedChat.date}</h2>
                
                <div className="space-y-8">
                  {selectedChat.messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                      <span className="text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-tighter">
                        {m.role === 'user' ? 'You' : 'Kaal AI'}
                      </span>
                      <p className={`text-gray-600 text-sm p-5 rounded-3xl max-w-[90%] shadow-sm leading-relaxed ${
                        m.role === 'user' ? 'bg-[#FBF9F6]' : 'bg-white'
                      }`}>
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <BookOpen size={48} className="mb-4 text-gray-300" />
                <p className="text-xl font-serif text-gray-400">Select a conversation to read it here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}