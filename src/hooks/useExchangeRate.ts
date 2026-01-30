import { useQuery } from '@tanstack/react-query'
import { fetchExchangeRate } from '@/services/api'

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: fetchExchangeRate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
