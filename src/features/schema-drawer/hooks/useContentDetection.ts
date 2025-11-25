import { ContentType } from '@/shared/types'
import { isElementsArray, isStringData } from '@/shared/utils/schema/transformers'
import { useCallback, useRef, useState } from 'react'

interface DetectionResult {
  type: ContentType
  canParse: boolean
}

interface UseContentDetectionReturn {
  contentType: ContentType
  canParse: boolean
  detectContentType: (value: string) => DetectionResult
  debouncedDetectContent: (value: string) => void
  /** 手动更新内容类型（用于外部转换后同步状态） */
  updateContentType: (result: DetectionResult) => void
}

/**
 * 内容类型检测 Hook
 */
export const useContentDetection = (): UseContentDetectionReturn => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.Other)
  const [canParse, setCanParse] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 统一检测编辑器内容类型和是否可解析
   */
  const detectContentType = useCallback((value: string): DetectionResult => {
    if (!value || value.trim() === '') {
      return { type: ContentType.Other, canParse: false }
    }

    try {
      const parsed = JSON.parse(value)
      
      if (isElementsArray(parsed)) {
        return { type: ContentType.Ast, canParse: true }
      }
      
      if (isStringData(parsed)) {
        return { type: ContentType.RawString, canParse: true }
      }
      
      return { type: ContentType.Other, canParse: true }
    } catch (error) {
      console.debug('内容类型检测失败:', error)
      return { type: ContentType.Other, canParse: false }
    }
  }, [])

  /**
   * 带防抖的内容检测（300ms防抖）
   */
  const debouncedDetectContent = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const result = detectContentType(value)
      setContentType(result.type)
      setCanParse(result.canParse)
    }, 300)
  }, [detectContentType])

  /**
   * 手动更新内容类型（用于外部转换后同步状态）
   */
  const updateContentType = useCallback((result: DetectionResult) => {
    setContentType(result.type)
    setCanParse(result.canParse)
  }, [])

  return {
    contentType,
    canParse,
    detectContentType,
    debouncedDetectContent,
    updateContentType
  }
}

