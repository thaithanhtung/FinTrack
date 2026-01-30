import { useState, useEffect, useCallback } from 'react'
import type { PriceAlert, GoldType, AlertCondition } from '@/types'

const STORAGE_KEY = 'fintrack_alerts'

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function loadAlerts(): PriceAlert[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const alerts = JSON.parse(stored)
      return alerts.map((alert: PriceAlert) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined,
      }))
    }
  } catch (error) {
    console.error('Error loading alerts:', error)
  }
  return []
}

function saveAlerts(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch (error) {
    console.error('Error saving alerts:', error)
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadAlerts())

  // Save to localStorage whenever alerts change
  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const addAlert = useCallback((
    goldType: GoldType | 'XAU',
    condition: AlertCondition,
    targetPrice: number,
    brand?: string
  ) => {
    const newAlert: PriceAlert = {
      id: generateId(),
      goldType,
      brand: brand as PriceAlert['brand'],
      condition,
      targetPrice,
      isActive: true,
      createdAt: new Date(),
    }
    setAlerts(prev => [...prev, newAlert])
    return newAlert
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }, [])

  const triggerAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, triggeredAt: new Date(), isActive: false } : alert
    ))
  }, [])

  const checkAlerts = useCallback((
    currentPrices: { goldType: GoldType | 'XAU'; price: number }[]
  ) => {
    const triggeredAlerts: PriceAlert[] = []
    
    alerts.forEach(alert => {
      if (!alert.isActive) return
      
      const priceData = currentPrices.find(p => p.goldType === alert.goldType)
      if (!priceData) return
      
      const shouldTrigger = 
        (alert.condition === 'ABOVE' && priceData.price >= alert.targetPrice) ||
        (alert.condition === 'BELOW' && priceData.price <= alert.targetPrice)
      
      if (shouldTrigger) {
        triggeredAlerts.push(alert)
        triggerAlert(alert.id)
      }
    })
    
    return triggeredAlerts
  }, [alerts, triggerAlert])

  const activeAlerts = alerts.filter(a => a.isActive)
  const triggeredAlerts = alerts.filter(a => a.triggeredAt)

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    addAlert,
    removeAlert,
    toggleAlert,
    checkAlerts,
  }
}
