import { MessageCircle } from 'lucide-react'

interface FloatingChatButtonProps {
  onClick: () => void
  hasUnread?: boolean
}

export function FloatingChatButton({ onClick, hasUnread = false }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95"
      aria-label="Mở chat AI"
    >
      <MessageCircle size={24} />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
          !
        </span>
      )}
    </button>
  )
}
