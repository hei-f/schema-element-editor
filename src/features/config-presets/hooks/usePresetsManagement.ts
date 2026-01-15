import type { ConfigPreset, ConfigPresetMeta } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { useCallback, useState } from 'react'

interface UsePresetsManagementProps {
  onApplyPreset: (preset: ConfigPreset) => Promise<void>
  onWarning?: (message: string) => void
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
}

interface UsePresetsManagementReturn {
  presetsList: ConfigPresetMeta[]
  presetsModalVisible: boolean
  addPresetModalVisible: boolean
  presetNameInput: string
  setPresetNameInput: (value: string) => void
  handleOpenAddPreset: () => void
  handleAddPreset: () => Promise<void>
  handleOpenPresets: () => Promise<void>
  handleApplyPreset: (preset: ConfigPresetMeta) => Promise<void>
  handleDeletePreset: (id: string) => Promise<void>
  closePresetsModal: () => void
  closeAddPresetModal: () => void
}

/**
 * 预设配置管理 Hook
 * 用于配置页的预设配置管理功能
 */
export const usePresetsManagement = ({
  onApplyPreset,
  onWarning,
  onError,
  onSuccess,
}: UsePresetsManagementProps): UsePresetsManagementReturn => {
  const [presetsModalVisible, setPresetsModalVisible] = useState(false)
  const [presetsList, setPresetsList] = useState<ConfigPresetMeta[]>([])
  const [addPresetModalVisible, setAddPresetModalVisible] = useState(false)
  const [presetNameInput, setPresetNameInput] = useState('')

  /**
   * 打开添加预设对话框
   */
  const handleOpenAddPreset = useCallback(() => {
    setPresetNameInput('')
    setAddPresetModalVisible(true)
  }, [])

  /**
   * 添加预设配置
   */
  const handleAddPreset = useCallback(async () => {
    if (!presetNameInput.trim()) {
      onWarning?.('请输入预设配置名称')
      return
    }

    if (presetNameInput.length > 50) {
      onWarning?.('预设配置名称不能超过50个字符')
      return
    }

    try {
      // 获取当前所有配置
      const currentConfig = await storage.getAllData()

      await storage.addConfigPreset(presetNameInput.trim(), currentConfig)
      onSuccess?.('已保存为预设配置')
      setAddPresetModalVisible(false)
      setPresetNameInput('')
    } catch (error) {
      console.error('添加预设配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : '添加预设配置失败'
      onError?.(errorMessage)
    }
  }, [presetNameInput, onWarning, onError, onSuccess])

  /**
   * 打开预设配置列表
   */
  const handleOpenPresets = useCallback(async () => {
    try {
      const presets = await storage.getPresetsMeta()
      setPresetsList(presets)
      setPresetsModalVisible(true)
    } catch (error) {
      console.error('加载预设配置列表失败:', error)
      onError?.('加载预设配置列表失败')
    }
  }, [onError])

  /**
   * 应用预设配置（懒加载完整配置内容）
   */
  const handleApplyPreset = useCallback(
    async (preset: ConfigPresetMeta) => {
      try {
        // 按需加载完整的配置内容
        const config = await storage.getPresetConfig(preset.id)
        if (!config) {
          onError?.('预设配置内容不存在')
          return
        }

        // 构造完整的 ConfigPreset 对象
        const fullPreset: ConfigPreset = {
          ...preset,
          config,
        }

        await onApplyPreset(fullPreset)
        setPresetsModalVisible(false)
      } catch (error) {
        console.error('应用预设配置失败:', error)
        onError?.('应用预设配置失败')
      }
    },
    [onApplyPreset, onError]
  )

  /**
   * 删除预设配置
   */
  const handleDeletePreset = useCallback(
    async (id: string) => {
      try {
        await storage.deleteConfigPreset(id)
        const presets = await storage.getPresetsMeta()
        setPresetsList(presets)
        onSuccess?.('预设配置已删除')
      } catch (error) {
        console.error('删除预设配置失败:', error)
        onError?.('删除预设配置失败')
      }
    },
    [onError, onSuccess]
  )

  const closePresetsModal = useCallback(() => setPresetsModalVisible(false), [])
  const closeAddPresetModal = useCallback(() => setAddPresetModalVisible(false), [])

  return {
    presetsList,
    presetsModalVisible,
    addPresetModalVisible,
    presetNameInput,
    setPresetNameInput,
    handleOpenAddPreset,
    handleAddPreset,
    handleOpenPresets,
    handleApplyPreset,
    handleDeletePreset,
    closePresetsModal,
    closeAddPresetModal,
  }
}
