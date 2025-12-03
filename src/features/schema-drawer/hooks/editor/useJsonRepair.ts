import { useCallback, useState } from 'react'
import { FULL_SCREEN_MODE, type FullScreenMode } from '@/shared/constants/ui-modes'
import { schemaTransformer } from '../../services/schema-transformer'
import { getJsonError, repairJson } from '../../utils/json-repair'
import type { CodeMirrorEditorHandle } from '../../components/editor/CodeMirrorEditor'

interface UseJsonRepairProps {
  editorValue: string
  editorRef: React.RefObject<CodeMirrorEditorHandle | null>
  getContentToAnalyze: (content: string) => { content: string; isInnerContent: boolean }
  updateEditorContent: (content: string, options?: { markModified?: boolean }) => void
  switchFullScreenMode: (mode: FullScreenMode) => void
  showLightNotification: (text: string) => void
  showError: (msg: string) => void
  showWarning: (msg: string) => void
}

interface UseJsonRepairReturn {
  /** 修复前的原始值（用于 diff 对比） */
  repairOriginalValue: string
  /** 待确认的修复内容 */
  pendingRepairedValue: string
  /** 定位错误 */
  handleLocateError: () => void
  /** 修复 JSON */
  handleRepairJson: () => void
  /** 应用修复 */
  handleApplyRepair: () => void
  /** 取消修复 */
  handleCancelRepair: () => void
  /** 返回编辑模式（从 Diff 模式） */
  handleBackToEditor: () => void
}

/**
 * JSON 修复 Hook
 * 提供错误定位、智能修复、diff 对比等功能
 */
export const useJsonRepair = (props: UseJsonRepairProps): UseJsonRepairReturn => {
  const {
    editorValue,
    editorRef,
    getContentToAnalyze,
    updateEditorContent,
    switchFullScreenMode,
    showLightNotification,
    showError,
    showWarning,
  } = props

  /** 修复前的原始内容 */
  const [repairOriginalValue, setRepairOriginalValue] = useState<string>('')
  /** 待确认的修复内容 */
  const [pendingRepairedValue, setPendingRepairedValue] = useState<string>('')

  /**
   * 定位错误
   */
  const handleLocateError = useCallback(() => {
    const { content, isInnerContent } = getContentToAnalyze(editorValue)

    // 先尝试直接解析
    const errorInfo = getJsonError(content)

    if (errorInfo) {
      // 格式化错误信息
      const errorMessage = `JSON 语法错误：${errorInfo.message}`

      if (isInnerContent) {
        // 字符串内部的错误，自动去转义后跳转
        const result = schemaTransformer.unescapeJson(editorValue)
        if (result.success && result.data) {
          updateEditorContent(result.data, { markModified: true })
          // 延迟显示错误，等待编辑器内容更新
          setTimeout(() => {
            editorRef.current?.showErrorWidget(errorInfo.line, errorInfo.column, errorMessage)
          }, 50)
        } else {
          // 去转义失败，只提示错误位置
          showWarning(
            `字符串内部的 JSON 有错误（第 ${errorInfo.line} 行, 第 ${errorInfo.column} 列）`
          )
        }
      } else {
        // 直接显示错误提示
        editorRef.current?.showErrorWidget(errorInfo.line, errorInfo.column, errorMessage)
      }
    } else {
      showLightNotification('JSON 格式正确，无语法错误')
    }
  }, [
    editorValue,
    editorRef,
    getContentToAnalyze,
    updateEditorContent,
    showLightNotification,
    showWarning,
  ])

  /**
   * 修复 JSON
   */
  const handleRepairJson = useCallback(() => {
    const { content, isInnerContent } = getContentToAnalyze(editorValue)
    const result = repairJson(content)

    if (result.success && result.repaired) {
      // 保存修复前的原始内容
      setRepairOriginalValue(editorValue)

      // 计算修复后的内容
      const repairedContent = isInnerContent ? JSON.stringify(result.repaired) : result.repaired

      // 保存待确认的修复内容（不立即应用）
      setPendingRepairedValue(repairedContent)

      // 进入 diff 模式让用户确认
      switchFullScreenMode(FULL_SCREEN_MODE.DIFF)
      showLightNotification(
        isInnerContent ? '字符串内部的 JSON 已修复，请确认是否应用' : 'JSON 已修复，请确认是否应用'
      )
    } else {
      // 检查是否已经是有效 JSON
      try {
        JSON.parse(content)
        showLightNotification('JSON 格式正确，无需修复')
      } catch {
        showError(result.error || '无法修复此 JSON，请手动检查')
      }
    }
  }, [editorValue, getContentToAnalyze, switchFullScreenMode, showLightNotification, showError])

  /**
   * 应用修复
   */
  const handleApplyRepair = useCallback(() => {
    if (pendingRepairedValue) {
      updateEditorContent(pendingRepairedValue, { markModified: true })
      showLightNotification('已应用修复')
    }
    // 清理状态并退出 diff 模式
    setPendingRepairedValue('')
    setRepairOriginalValue('')
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
  }, [pendingRepairedValue, updateEditorContent, showLightNotification, switchFullScreenMode])

  /**
   * 取消修复
   */
  const handleCancelRepair = useCallback(() => {
    // 清理状态并退出 diff 模式
    setPendingRepairedValue('')
    setRepairOriginalValue('')
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    showLightNotification('已取消修复')
  }, [switchFullScreenMode, showLightNotification])

  /**
   * 返回编辑模式（从 Diff 模式）
   */
  const handleBackToEditor = useCallback(() => {
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    // 清除修复对比的原始值
    setRepairOriginalValue('')
  }, [switchFullScreenMode])

  return {
    repairOriginalValue,
    pendingRepairedValue,
    handleLocateError,
    handleRepairJson,
    handleApplyRepair,
    handleCancelRepair,
    handleBackToEditor,
  }
}
