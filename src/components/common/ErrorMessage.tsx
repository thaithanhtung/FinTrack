import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ 
  message = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-gray-600">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={16} />
          Thử lại
        </Button>
      )}
    </div>
  )
}
