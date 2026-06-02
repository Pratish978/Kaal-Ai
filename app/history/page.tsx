"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookOpen, Calendar, ChevronRight, AlertCircle, Trash2, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context"; 
import { useRouter } from "next/navigation"; 

interface Message {
  role: string;
  content: string; 
}

interface SavedConversation {
  id: string; // Serves as session_id
  title: string;
  lastMessage: string;
  messages: Message[];
}

// Frontend heuristic to generate ChatGPT-style meaningful titles without backend changes
const generateMeaningfulTitle = (messages: Message[]): string => {
  const firstUserMsg = messages.find(m => m.role === 'user')?.content || "";
  const text = firstUserMsg.toLowerCase().trim();

  if (!text || text.length < 8) return "New Reflection";

  // Ignore raw basic greetings
  const greetings = ["hi", "hello", "ok", "hiii", "hey", "ha", "haan", "yes", "theek", "hmm", "helloo"];
  if (greetings.includes(text)) return "New Reflection";

  // Map common Hindi/Hinglish/English phrases to meaningful 2-5 word titles
  if (/(achha feel nahi|low|sad|depress|ro rha|rona|unhappy|dukh|cry)/i.test(text)) return "Feeling Emotionally Low";
  if (/(relationship|breakup|gf|bf|partner|shadi|marriage|pyaar|love|husband|wife)/i.test(text)) return "Relationship Struggles";
  if (/(career|job|tension|exam|study|work|office|interview|future|padhai)/i.test(text)) return "Career Anxiety";
  if (/(anxiet|panic|dar |fear|darr|scared|ghabra)/i.test(text)) return "Dealing with Anxiety";
  if (/(sleep|neend|so nahi|insomnia|wake up)/i.test(text)) return "Sleep Issues";
  if (/(lonely|akela|akelepan|no friends|koi nahi)/i.test(text)) return "Feelings of Loneliness";
  if (/(stress|pareshan|thak|exhausted|burnout)/i.test(text)) return "Managing Stress";
  if (/(family|ghar|parents|mummy|papa|mother|father)/i.test(text)) return "Family Dynamics";
  if (/(gussa|angry|anger|frustrat|irritat)/i.test(text)) return "Processing Anger";

  // Fallback: Clean 3-4 word truncation of the actual message
  const words = firstUserMsg.split(/\s+/).slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1) + "...";
};

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<SavedConversation | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user === undefined) return;
      
      if (!user?.id) {
        setErrorMessage("Please log in to view your history.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const url = `${baseUrl}/api/saved-chats/${user.id}`;
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.success && Array.isArray(data.chats)) {
          const formatted: SavedConversation[] = data.chats.map((item: any) => {
            const msgs = Array.isArray(item.messages) ? item.messages : [];
            
            // Extract the first assistant response as the preview
            const firstAssistantMsg = msgs.find((m: Message) => m.role === 'assistant')?.content;
            const previewMsg = firstAssistantMsg 
              ? firstAssistantMsg.length > 60 ? firstAssistantMsg.slice(0, 60) + "..." : firstAssistantMsg 
              : "No message content";

            return {
              id: item.session_id, 
              title: generateMeaningfulTitle(msgs), // Dynamic ChatGPT-style title
              lastMessage: previewMsg,
              messages: msgs
            };
          });
          
          setConversations(formatted);
        } else {
          setConversations([]);
        }
      } catch (err: any) {
        console.error("Unexpected Application Error:", err);
        setErrorMessage(err.message || "An unexpected error occurred while loading history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleDeleteChat = async (sessionId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const url = `${baseUrl}/api/delete-chat/${sessionId}`;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }
      
      setConversations(prev => prev.filter(c => c.id !== sessionId));
      if (selectedChat?.id === sessionId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      setErrorMessage("Failed to delete the conversation.");
    }
  };

  const handleResumeChat = (chat: SavedConversation) => {
    localStorage.setItem("kaal_restored_session", chat.id);
    localStorage.setItem("kaal_restored_messages", JSON.stringify(chat.messages));
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col">
      <Navbar/>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-16 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Your conversations</h1>
          <p className="text-gray-500 text-sm">A private space to revisit your past reflections.</p>
        </div>

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
                <p className="text-gray-400 text-xs italic">No saved conversations yet</p>
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
                      <div className="max-w-[85%]">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{chat.title}</h3>
                        {/* Timestamps removed completely for cleaner UI */}
                        <p className="text-xs text-gray-400 truncate italic">{chat.lastMessage}</p>
                      </div>
                      <ChevronRight size={16} className={`text-gray-300 transition-transform mt-1 ${selectedChat?.id === chat.id ? "rotate-90 text-[#E9B87D]" : ""}`} />
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-[#E9B87D] font-bold text-[10px] tracking-widest">
                    <Calendar size={14} /> SESSION LOG
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResumeChat(selectedChat)}
                      className="flex items-center gap-2 text-[11px] font-bold text-[#E9B87D] hover:text-[#d4a062] transition-colors uppercase tracking-wider bg-transparent border border-[#E9B87D] px-4 py-2 rounded-full"
                    >
                      <MessageSquarePlus size={14} /> Resume Chat
                    </button>
                    <button 
                      onClick={() => handleDeleteChat(selectedChat.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-2"
                      aria-label="Delete Conversation"
                      title="Delete Conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h2 className="text-3xl font-serif text-gray-800 mb-10">{selectedChat.title}</h2>
                
                <div className="space-y-8">
                  {selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                        <span className="text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-tighter">
                          {m.role === 'user' ? 'You' : 'Kaal AI'}
                        </span>
                        <p className={`text-gray-600 text-sm p-5 rounded-3xl max-w-[90%] shadow-sm leading-relaxed ${
                          m.role === 'user' ? 'bg-[#FBF9F6]' : 'bg-white'
                        }`}>
                          {m.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 italic mt-10">
                      No message history found for this session.
                    </div>
                  )}
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