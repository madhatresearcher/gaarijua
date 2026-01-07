"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import CompareTray, { CompareItem } from './CompareTray'

const STORAGE_KEY = 'gaariua-compare-tray'
const MAX_COMPARE_ITEMS = 4

type CompareContextValue = {
  tray: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (id: string) => void
  clearTray: () => void
  max: number
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined)

export function useCompareTray() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompareTray must be used within a CompareTrayProvider')
  }
  return context
}

export default function CompareTrayProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [tray, setTray] = useState<CompareItem[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setTray(parsed)
      }
    } catch (error) {
      console.error('unable to read compare tray', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tray))
  }, [tray])

  useEffect(() => {
    if (!message) return
    if (typeof window === 'undefined') return
    const timer = window.setTimeout(() => setMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [message])

  const addItem = useCallback((item: CompareItem) => {
    setTray((prev) => {
      if (prev.some((entry) => entry.id === item.id)) {
        return prev
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        setMessage('Tray is full. Remove an item to add another.')
        return prev
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setTray((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const clearTray = useCallback(() => {
    setTray([])
  }, [])

  const handleCompareNow = useCallback(() => {
    if (tray.length < 2) return
    const ids = tray.map((entry) => entry.id).join(',')
    router.push(`/compare?ids=${ids}`)
  }, [router, tray])

  const contextValue = useMemo(
    () => ({ tray, addItem, removeItem, clearTray, max: MAX_COMPARE_ITEMS }),
    [tray, addItem, removeItem, clearTray]
  )

  return (
    <CompareContext.Provider value={contextValue}>
      {children}
      {tray.length > 0 && (
        <CompareTray
          tray={tray}
          max={MAX_COMPARE_ITEMS}
          message={message}
          compareDisabled={tray.length < 2}
          onRemove={removeItem}
          onClear={clearTray}
          onCompareNow={handleCompareNow}
        />
      )}
    </CompareContext.Provider>
  )
}