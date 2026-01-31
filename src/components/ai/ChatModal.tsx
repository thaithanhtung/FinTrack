import { useState, useRef, useEffect } from 'react'
import { X, Send, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useAIChat } from '@/hooks'
import { ChatMessageItem } from './ChatMessage'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { messages, sendMessage, clearHistory, isLoading, error } = useAIChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg h-[80vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <div>
              <h3 className="font-semibold">Vàng AI</h3>
              <p className="text-xs text-purple-200">Trợ lý tư vấn vàng</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-purple-500" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Xin chào!</h4>
              <p className="text-sm text-gray-500 mb-4">
                Tôi là Vàng AI, trợ lý tư vấn về thị trường vàng. 
                Bạn có thể hỏi tôi về giá vàng, xu hướng thị trường, hoặc gợi ý đầu tư.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Giá vàng hôm nay?',
                  'Nên mua hay bán?',
                  'Xu hướng tuần này?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion)
                      inputRef.current?.focus()
                    }}
                    className="px-3 py-1.5 bg-white border border-purple-200 rounded-full text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 size={20} className="animate-spin text-purple-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
            Lỗi: {error.message}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            AI chỉ mang tính tham khảo, không phải lời khuyên đầu tư
          </p>
        </form>
      </div>
    </div>
  )
}
