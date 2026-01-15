import type { ConfigPresetMeta } from '@/shared/types'
import React from 'react'
import { AddPresetModal } from './AddPresetModal'
import { PresetsListModal } from './PresetsListModal'

interface PresetsManagerProps {
  addPresetModalVisible: boolean
  presetNameInput: string
  presetsModalVisible: boolean
  presetsList: ConfigPresetMeta[]
  themeColor: string
  onAddPresetInputChange: (value: string) => void
  onAddPreset: () => void
  onCloseAddPresetModal: () => void
  onClosePresetsModal: () => void
  onApplyPreset: (preset: ConfigPresetMeta) => Promise<void>
  onDeletePreset: (id: string) => Promise<void>
}

/**
 * 预设配置功能管理器 - 组合所有预设配置相关的模态框
 */
export const PresetsManager: React.FC<PresetsManagerProps> = (props) => {
  const {
    addPresetModalVisible,
    presetNameInput,
    presetsModalVisible,
    presetsList,
    themeColor,
    onAddPresetInputChange,
    onAddPreset,
    onCloseAddPresetModal,
    onClosePresetsModal,
    onApplyPreset,
    onDeletePreset,
  } = props

  return (
    <>
      <AddPresetModal
        visible={addPresetModalVisible}
        presetNameInput={presetNameInput}
        themeColor={themeColor}
        onInputChange={onAddPresetInputChange}
        onAdd={onAddPreset}
        onClose={onCloseAddPresetModal}
      />

      <PresetsListModal
        visible={presetsModalVisible}
        presetsList={presetsList}
        themeColor={themeColor}
        onApply={onApplyPreset}
        onDelete={onDeletePreset}
        onClose={onClosePresetsModal}
      />
    </>
  )
}
