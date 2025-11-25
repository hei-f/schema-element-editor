import { storage } from '@/shared/utils/browser/storage'
import { useState } from 'react'
import { schemaTransformer } from '../services/schema-transformer'

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
  onSave
}: UseSchemaSaveProps): UseSchemaSaveReturn => {
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 执行保存操作
   */
  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    
    try {
      // 使用SchemaTransformer准备保存数据
      const result = schemaTransformer.prepareSaveData(editorValue, wasStringData)
      
      if (!result.success) {
        throw new Error(result.error || '数据转换失败')
      }
      
      // 调用保存API
      await onSave(result.data)
      
      // 删除草稿
      await storage.deleteDraft(paramsKey)
      
      // 触发成功回调
      onSaveSuccess()
    } catch (error: any) {
      throw new Error(`保存失败: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    handleSave
  }
}
