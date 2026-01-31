import { useQuery } from '@tanstack/react-query'
import { fetchAIAnalysis } from '@/services/api'

export function useAIAnalysis() {
  return useQuery({
    queryKey: ['aiAnalysis'],
    queryFn: fetchAIAnalysis,
    staleTime: 30 * 60 * 1000, // 30 minutes - data considered fresh
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
    retry: 2,
  })
}
