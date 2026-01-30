import { useQuery } from '@tanstack/react-query'
import { fetchWorldGoldPrice, fetchWorldGoldHistory } from '@/services/api'
import type { TimeRange } from '@/types'

export function useWorldGoldPrice() {
  return useQuery({
    queryKey: ['worldGoldPrice'],
    queryFn: fetchWorldGoldPrice,
  })
}

export function useWorldGoldHistory(range: TimeRange) {
  return useQuery({
    queryKey: ['worldGoldHistory', range],
    queryFn: () => fetchWorldGoldHistory(range),
    staleTime: 5 * 60 * 1000, // 5 minutes for historical data
  })
}
