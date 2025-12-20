import type { ConfigPreset } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { useCallback, useState } from 'react'

interface UsePresetsManagementProps {
  onApplyPreset: (preset: ConfigPreset) => Promise<void>
  onWarning?: (message: string) => void
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
}

interface UsePresetsManagementReturn {
  presetsList: ConfigPreset[]
  presetsModalVisible: boolean
  addPresetModalVisible: boolean
  presetNameInput: string
  setPresetNameInput: (value: string) => void
  handleOpenAddPreset: () => void
  handleAddPreset: () => Promise<void>
  handleOpenPresets: () => Promise<void>
  handleApplyPreset: (preset: ConfigPreset) => void
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
  const [presetsList, setPresetsList] = useState<ConfigPreset[]>([])
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
      onError?.('添加预设配置失败')
    }
  }, [presetNameInput, onWarning, onError, onSuccess])

  /**
   * 打开预设配置列表
   */
  const handleOpenPresets = useCallback(async () => {
    try {
      const presets = await storage.getConfigPresets()
      setPresetsList(presets)
      setPresetsModalVisible(true)
    } catch (error) {
      console.error('加载预设配置列表失败:', error)
      onError?.('加载预设配置列表失败')
    }
  }, [onError])

  /**
   * 应用预设配置
   */
  const handleApplyPreset = useCallback(
    (preset: ConfigPreset) => {
      onApplyPreset(preset)
      setPresetsModalVisible(false)
    },
    [onApplyPreset]
  )

  /**
   * 删除预设配置
   */
  const handleDeletePreset = useCallback(
    async (id: string) => {
      try {
        await storage.deleteConfigPreset(id)
        const presets = await storage.getConfigPresets()
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
