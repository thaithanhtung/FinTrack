import { Clock, AlertTriangle } from 'lucide-react';

interface LastUpdatedProps {
  timestamp: Date;
  showWarning?: boolean;
  warningThresholdMinutes?: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LastUpdated({
  timestamp,
  showWarning = true,
  warningThresholdMinutes = 5,
}: LastUpdatedProps) {
  const now = new Date();
  const diffMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);
  const isStale = diffMinutes > warningThresholdMinutes;

  return (
    <div className='flex items-center gap-1.5 text-xs'>
      {isStale && showWarning ? (
        <>
          <AlertTriangle size={12} className='text-amber-500' />
          <span className='text-amber-600'>
            Dữ liệu trễ - {formatTime(timestamp)}
          </span>
        </>
      ) : (
        <>
          <Clock size={12} className='text-green-500' />
          <span className='text-gray-600'>
            Dữ liệu Thời Gian Thực:{' '}
            <span className='font-medium text-green-600'>
              {formatTime(timestamp)}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
