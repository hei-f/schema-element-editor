import type { HistoryEntry } from '@/shared/types'
import { HistoryEntryType } from '@/shared/types'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import { logger } from '@/shared/utils/logger'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseEditHistoryProps {
  paramsKey: string
  editorValue: string
  maxHistoryCount: number
  /** 是否启用历史记录功能（false 时不记录历史） */
  enabled?: boolean
  onLoadVersion: (content: string, entry: HistoryEntry) => void
  onClearHistory?: () => void
}

interface UseEditHistoryReturn {
  history: HistoryEntry[]
  currentIndex: number
  hasHistory: boolean
  recordChange: (value: string) => void
  recordSpecialVersion: (type: HistoryEntryType, description?: string, content?: string) => void
  loadHistoryVersion: (index: number) => void
  clearHistory: () => void
}

/**
 * 生成 sessionStorage 键名
 */
const getStorageKey = (paramsKey: string): string => `edit-history:${paramsKey}`

/**
 * 编辑历史管理 Hook
 *
 * 功能：
 * - 自动记录编辑历史（防抖 2 秒）
 * - 特殊版本记录（保存、草稿、收藏等）
 * - 普通版本数量限制（FIFO 队列）
 * - 特殊版本不计入数量限制
 * - sessionStorage 持久化（按 paramsKey）
 */
export const useEditHistory = ({
  paramsKey,
  editorValue,
  maxHistoryCount,
  enabled = true,
  onLoadVersion,
  onClearHistory,
}: UseEditHistoryProps): UseEditHistoryReturn => {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [specialEntries, setSpecialEntries] = useState<HistoryEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastRecordedContentRef = useRef<string>('')
  const storageKey = getStorageKey(paramsKey)
  const entriesRef = useRef<HistoryEntry[]>([])
  const specialEntriesRef = useRef<HistoryEntry[]>([])

  // 同步 ref
  useEffect(() => {
    entriesRef.current = entries
    specialEntriesRef.current = specialEntries
  }, [entries, specialEntries])

  /**
   * 合并后的完整历史列表（按时间戳倒序排序，最新的在前）
   */
  const mergedHistory = useMemo(() => {
    const merged = [...specialEntries, ...entries].sort((a, b) => b.timestamp - a.timestamp)
    return merged
  }, [entries, specialEntries])

  const hasHistory = mergedHistory.length > 0

  /**
   * 从 sessionStorage 加载历史
   */
  const loadFromStorage = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        setEntries(data.entries || [])
        setSpecialEntries(data.specialEntries || [])
        setCurrentIndex(data.currentIndex ?? -1)
        lastRecordedContentRef.current = ''
        logger.log(
          `加载历史记录: ${data.entries.length} 条普通, ${data.specialEntries.length} 条特殊`
        )
      } else {
        // 没有存储的历史时，重置状态（避免显示其他 params 的历史）
        setEntries([])
        setSpecialEntries([])
        setCurrentIndex(-1)
        lastRecordedContentRef.current = ''
      }
    } catch (error) {
      logger.error('加载历史记录失败:', error)
      // 加载失败时也重置状态
      setEntries([])
      setSpecialEntries([])
      setCurrentIndex(-1)
      lastRecordedContentRef.current = ''
    }
  }, [storageKey])

  /**
   * 保存到 sessionStorage
   */
  const saveToStorage = useCallback(
    (newEntries: HistoryEntry[], newSpecialEntries: HistoryEntry[], newIndex: number) => {
      try {
        const data = {
          entries: newEntries,
          specialEntries: newSpecialEntries,
          currentIndex: newIndex,
        }
        sessionStorage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        logger.error('保存历史记录失败:', error)
      }
    },
    [storageKey]
  )

  /**
   * 功能禁用时重置状态
   */
  useDeferredEffect(() => {
    if (!enabled) {
      setEntries([])
      setSpecialEntries([])
      setCurrentIndex(-1)
    }
  }, [enabled])

  /**
   * 功能启用时加载历史
   */
  useDeferredEffect(() => {
    if (enabled) {
      loadFromStorage()
    }
  }, [loadFromStorage, enabled])

  /**
   * 添加历史条目
   */
  const addHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      // 去重：内容相同则不记录
      if (entry.content === lastRecordedContentRef.current) {
        return
      }

      lastRecordedContentRef.current = entry.content

      // 判断是否为特殊版本
      const isSpecial = entry.type !== 'auto' && entry.type !== 'manual'

      if (isSpecial) {
        // 特殊版本：不计入限制
        const newSpecialEntries = [...specialEntriesRef.current, entry]
        const merged = [...newSpecialEntries, ...entriesRef.current].sort(
          (a, b) => b.timestamp - a.timestamp
        )
        const newIndex = merged.findIndex((e) => e.id === entry.id)

        setSpecialEntries(newSpecialEntries)
        setCurrentIndex(newIndex)
        saveToStorage(entriesRef.current, newSpecialEntries, newIndex)
      } else {
        // 普通版本：应用限制
        const newEntries = [...entriesRef.current, entry]

        // FIFO：超过限制时删除最旧的
        if (newEntries.length > maxHistoryCount) {
          newEntries.shift()
        }

        const merged = [...specialEntriesRef.current, ...newEntries].sort(
          (a, b) => b.timestamp - a.timestamp
        )
        const newIndex = merged.findIndex((e) => e.id === entry.id)

        setEntries(newEntries)
        setCurrentIndex(newIndex)
        saveToStorage(newEntries, specialEntriesRef.current, newIndex)
      }
    },
    [maxHistoryCount, saveToStorage]
  )

  /**
   * 防抖记录变更（2秒）
   */
  const recordChange = useCallback(
    (value: string) => {
      // 功能禁用时跳过
      if (!enabled) {
        return
      }

      // 如果内容与上次记录的内容相同，直接返回
      if (value === lastRecordedContentRef.current) {
        return
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        // 再次检查，因为在防抖期间可能已经通过其他方式保存了
        if (value === lastRecordedContentRef.current) {
          return
        }

        const entry: HistoryEntry = {
          id: Date.now().toString(),
          content: value,
          timestamp: Date.now(),
          type: HistoryEntryType.AutoSave,
          description: '自动保存',
        }
        addHistoryEntry(entry)
      }, 2000)
    },
    [addHistoryEntry, enabled]
  )

  /**
   * 记录特殊版本（立即）
   */
  const recordSpecialVersion = useCallback(
    (type: HistoryEntryType, description?: string, content?: string) => {
      // 功能禁用时跳过
      if (!enabled) {
        return
      }

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        content: content || editorValue,
        timestamp: Date.now(),
        type,
        description,
      }
      addHistoryEntry(entry)
    },
    [editorValue, addHistoryEntry, enabled]
  )

  /**
   * 加载历史版本
   */
  const loadHistoryVersion = useCallback(
    (index: number) => {
      if (index < 0 || index >= mergedHistory.length) {
        logger.warn(`无效的历史索引: ${index}`)
        return
      }

      const entry = mergedHistory[index]
      setCurrentIndex(index)

      // 通过回调通知组件
      onLoadVersion(entry.content, entry)

      // 更新 storage
      saveToStorage(entries, specialEntries, index)
    },
    [mergedHistory, entries, specialEntries, onLoadVersion, saveToStorage]
  )

  /**
   * 清除历史
   */
  const clearHistory = useCallback(() => {
    // 完全清空历史记录
    setEntries([])
    setSpecialEntries([])
    setCurrentIndex(-1)
    lastRecordedContentRef.current = ''

    saveToStorage([], [], -1)

    onClearHistory?.()
    logger.log('历史记录已清除')
  }, [saveToStorage, onClearHistory])

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    history: mergedHistory,
    currentIndex,
    hasHistory,
    recordChange,
    recordSpecialVersion,
    loadHistoryVersion,
    clearHistory,
  }
}
