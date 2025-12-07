import { ContentType } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { useState } from 'react'
import { schemaTransformer } from '../../services/schema-transformer'

interface UseSchemaSaveProps {
  /** 编辑器当前值 */
  editorValue: string
  /** 原始数据是否为字符串类型 */
  wasStringData: boolean
  /** 参数Key，用于删除草稿 */
  paramsKey: string
  /** 保存成功后的回调 */
  onSaveSuccess: () => void
  /** 保存数据的API调用 */
  onSave: (data: any) => Promise<void>
  /** 是否处于录制模式 */
  isRecordingMode?: boolean
  /** 当前内容类型（用于录制模式下判断是否需要转换） */
  contentType?: ContentType
}

interface UseSchemaSaveReturn {
  /** 是否正在保存 */
  isSaving: boolean
  /** 执行保存操作 */
  handleSave: () => Promise<void>
}

/**
 * Schema保存逻辑Hook
 * 封装了保存时的数据转换和状态管理
 */
export const useSchemaSave = ({
  editorValue,
  wasStringData,
  paramsKey,
  onSaveSuccess,
  onSave,
  isRecordingMode = false,
  contentType,
}: UseSchemaSaveProps): UseSchemaSaveReturn => {
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 准备保存数据（使用卫语句减少嵌套）
   */
  const prepareDataToSave = (): unknown => {
    // 录制模式 + 原始是字符串 + 当前是 AST 视图：需要转换回 RawString
    if (isRecordingMode && wasStringData && contentType === ContentType.Ast) {
      const result = schemaTransformer.convertToMarkdown(editorValue)
      if (!result.success || !result.data) {
        throw new Error(result.error || '转换为 RawString 失败')
      }
      return result.data
    }

    // 录制模式（其他情况）：保持原始格式
    if (isRecordingMode) {
      return editorValue
    }

    // 默认模式：使用 SchemaTransformer 准备保存数据
    const result = schemaTransformer.prepareSaveData(editorValue, wasStringData)
    if (!result.success) {
      throw new Error(result.error || '数据转换失败')
    }
    return result.data
  }

  /**
   * 执行保存操作
   */
  const handleSave = async (): Promise<void> => {
    setIsSaving(true)

    try {
      const dataToSave = prepareDataToSave()

      await onSave(dataToSave)
      await storage.deleteDraft(paramsKey)
      onSaveSuccess()
    } catch (error: any) {
      throw new Error(`保存失败: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    handleSave,
  }
}
