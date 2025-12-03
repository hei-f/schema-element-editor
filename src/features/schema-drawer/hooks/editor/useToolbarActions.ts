import { useCallback } from 'react'
import { ContentType } from '@/shared/types'
import { schemaTransformer } from '../../services/schema-transformer'

interface UseToolbarActionsProps {
  editorValue: string
  updateEditorContent: (
    content: string,
    options?: { markModified?: boolean; detectType?: boolean }
  ) => void
  showLightNotification: (text: string) => void
  showError: (msg: string) => void
  showWarning: (msg: string) => void
}

interface UseToolbarActionsReturn {
  handleFormat: () => void
  handleEscape: () => void
  handleUnescape: () => void
  handleCompact: () => void
  handleParse: () => void
  handleSegmentChange: (value: string | number) => void
}

/**
 * 工具栏操作 Hook
 * 提供格式化、转义、压缩、解析等操作
 */
export const useToolbarActions = (props: UseToolbarActionsProps): UseToolbarActionsReturn => {
  const { editorValue, updateEditorContent, showLightNotification, showError, showWarning } = props

  /**
   * 格式化 JSON
   */
  const handleFormat = useCallback(() => {
    const result = schemaTransformer.formatJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { detectType: false })
      showLightNotification('格式化成功')
    } else {
      showError(`格式化失败: ${result.error}`)
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 转义 JSON
   */
  const handleEscape = useCallback(() => {
    const result = schemaTransformer.escapeJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转义成功')
    } else {
      showError(result.error || '转义失败')
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 去转义 JSON
   */
  const handleUnescape = useCallback(() => {
    const result = schemaTransformer.unescapeJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('去转义成功')
    } else {
      showError(result.error || '去转义失败')
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 压缩 JSON
   */
  const handleCompact = useCallback(() => {
    const result = schemaTransformer.compactJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('压缩成功')
    } else {
      showError(result.error || '压缩失败')
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 解析嵌套 JSON
   */
  const handleParse = useCallback(() => {
    const result = schemaTransformer.parseNestedJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })

      if (result.error) {
        showWarning(`${result.error}，已显示当前解析结果`)
      } else if (result.parseCount && result.parseCount > 0) {
        showLightNotification(`解析成功（解析层数: ${result.parseCount}）`)
      } else {
        showLightNotification('解析成功')
      }
    } else {
      showError(result.error || '解析失败')
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError, showWarning])

  /**
   * 转换为 AST
   */
  const handleConvertToAST = useCallback(() => {
    const result = schemaTransformer.convertToAST(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转换为AST成功')
    } else {
      showError(`转换失败：${result.error}`)
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 转换为 Markdown
   */
  const handleConvertToMarkdown = useCallback(() => {
    const result = schemaTransformer.convertToMarkdown(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转换为RawString成功')
    } else {
      showError(`转换失败：${result.error}`)
    }
  }, [editorValue, updateEditorContent, showLightNotification, showError])

  /**
   * 处理 Segment 切换
   */
  const handleSegmentChange = useCallback(
    (value: string | number) => {
      if (value === ContentType.Ast) {
        handleConvertToAST()
      } else if (value === ContentType.RawString) {
        handleConvertToMarkdown()
      }
    },
    [handleConvertToAST, handleConvertToMarkdown]
  )

  return {
    handleFormat,
    handleEscape,
    handleUnescape,
    handleCompact,
    handleParse,
    handleSegmentChange,
  }
}
