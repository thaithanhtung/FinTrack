import { ReactNode, useState } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { FloatingChatButton, ChatModal } from '@/components/ai'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>
      <BottomNav />
      
      {/* AI Chat */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
