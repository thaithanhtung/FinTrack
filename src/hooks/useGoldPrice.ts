import { useQuery } from '@tanstack/react-query'
import { fetchVNGoldPrices, fetchVNGoldByType, fetchVNGoldByBrand, fetchSJCPrice } from '@/services/api'
import type { GoldType, GoldBrand } from '@/types'

export function useVNGoldPrices() {
  return useQuery({
    queryKey: ['vnGoldPrices'],
    queryFn: fetchVNGoldPrices,
  })
}

export function useVNGoldByType(type: GoldType) {
  return useQuery({
    queryKey: ['vnGoldPrices', 'type', type],
    queryFn: () => fetchVNGoldByType(type),
  })
}

export function useVNGoldByBrand(brand: GoldBrand) {
  return useQuery({
    queryKey: ['vnGoldPrices', 'brand', brand],
    queryFn: () => fetchVNGoldByBrand(brand),
  })
}

export function useSJCPrice() {
  return useQuery({
    queryKey: ['vnGoldPrices', 'sjc'],
    queryFn: fetchSJCPrice,
  })
}
