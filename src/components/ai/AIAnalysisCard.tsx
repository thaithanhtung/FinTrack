import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, Loading } from '@/components/common';
import { useAIAnalysis } from '@/hooks';
import type { AIRecommendation } from '@/types';

// Badge cho gợi ý
function RecommendationBadge({
  recommendation,
  confidence,
}: {
  recommendation: AIRecommendation;
  confidence: number;
}) {
  const config = {
    BUY: {
      label: 'Nên Mua',
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
    SELL: {
      label: 'Nên Bán',
      icon: TrendingDown,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
    },
    HOLD: {
      label: 'Giữ Nguyên',
      icon: Minus,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
    },
  };

  const {
    label,
    icon: Icon,
    bgColor,
    textColor,
    borderColor,
  } = config[recommendation];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bgColor} ${textColor} ${borderColor}`}
    >
      <Icon size={14} />
      <span className='text-sm font-medium'>{label}</span>
      <span className='text-xs opacity-75'>({confidence}%)</span>
    </div>
  );
}

// Format thời gian
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return date.toLocaleDateString('vi-VN');
}

export function AIAnalysisCard() {
  const { data, isLoading, isError, refetch, isFetching } = useAIAnalysis();

  if (isLoading) {
    return (
      <Card>
        <Loading size='sm' text='Đang phân tích thị trường...' />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader
          title='AI Phân Tích'
          subtitle='Phân tích thị trường'
          action={<Sparkles size={18} className='text-purple-500' />}
        />
        <div className='flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3'>
          <AlertTriangle size={16} />
          <span className='text-sm'>
            Chưa thể tải phân tích AI. Vui lòng thử lại sau.
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className='mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1'
        >
          <RefreshCw size={14} />
          Thử lại
        </button>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'>
      <CardHeader
        title='AI Phân Tích'
        subtitle='Phân tích thị trường vàng'
        action={
          <div className='flex items-center gap-2'>
            <Sparkles size={18} className='text-purple-500' />
            {isFetching && (
              <RefreshCw size={14} className='text-purple-400 animate-spin' />
            )}
          </div>
        }
      />

      <div className='space-y-4'>
        {/* Recommendation Badge */}
        <div className='flex items-center justify-between'>
          <RecommendationBadge
            recommendation={data.recommendation}
            confidence={data.confidence}
          />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className='text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-50'
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
            Cập nhật
          </button>
        </div>

        {/* Analysis Content */}
        <div className='bg-white/60 rounded-lg p-3'>
          <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
            {data.content}
          </p>
        </div>

        {/* Price Snapshot */}
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='bg-white/40 rounded-lg p-2'>
            <p className='text-gray-500'>Giá thế giới</p>
            <p className='font-semibold text-gray-700'>
              ${data.priceSnapshot.worldPrice.toFixed(2)}
              <span
                className={`ml-1 ${
                  data.priceSnapshot.worldChangePercent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                ({data.priceSnapshot.worldChangePercent >= 0 ? '+' : ''}
                {data.priceSnapshot.worldChangePercent.toFixed(2)}%)
              </span>
            </p>
          </div>
          <div className='bg-white/40 rounded-lg p-2'>
            <p className='text-gray-500'>Giá SJC</p>
            <p className='font-semibold text-gray-700'>
              {(data.priceSnapshot.vnPrice / 1000000).toFixed(2)}tr
            </p>
          </div>
        </div>

        {/* Timestamp & Disclaimer */}
        <div className='pt-2 border-t border-purple-200/50'>
          <p className='text-xs text-gray-500'>
            Cập nhật: {formatTimeAgo(data.createdAt)}
          </p>
          <p className='text-xs text-gray-400 mt-1 italic'>
            * Chỉ mang tính tham khảo, không phải lời khuyên đầu tư
          </p>
        </div>
      </div>
    </Card>
  );
}
