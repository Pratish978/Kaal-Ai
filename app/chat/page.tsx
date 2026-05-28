import { Navbar } from "@/components/navbar"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col bg-background">
      <Navbar showBackButton />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  )
}
