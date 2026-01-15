import type { ConfigPreset, ConfigPresetMeta, EditorTheme } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { ProfileOutlined } from '@ant-design/icons'
import { Dropdown, Tooltip } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { DrawerTitleButton } from '../DrawerTitle/styles'
import {
  PresetsDropdownContainer,
  PresetsDropdownEmptyIcon,
  PresetsDropdownEmptyState,
  PresetsDropdownInfo,
  PresetsDropdownItem,
  PresetsDropdownItemContent,
  PresetsDropdownList,
  PresetsDropdownName,
  PresetsDropdownTime,
} from '../../styles/toolbar/presets-dropdown.styles'

interface PresetsDropdownProps {
  onApplyPreset: (preset: ConfigPreset) => Promise<void>
  themeColor?: string
  editorTheme?: EditorTheme
  showText?: boolean
}

/**
 * 时间格式化
 */
const formatTimeAgo = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 预设配置选择下拉组件
 */
export const PresetsDropdown: React.FC<PresetsDropdownProps> = ({
  onApplyPreset,
  themeColor = '#0066ff',
  editorTheme = 'light',
  showText = false,
}) => {
  const [open, setOpen] = useState(false)
  const [presetsList, setPresetsList] = useState<ConfigPresetMeta[]>([])
  const isDark = editorTheme !== 'light'

  /**
   * 加载预设配置元数据列表
   */
  const loadPresets = useCallback(async () => {
    try {
      const presets = await storage.getPresetsMeta()
      setPresetsList(presets)
    } catch (error) {
      console.error('加载预设配置列表失败:', error)
      setPresetsList([])
    }
  }, [])

  /**
   * 打开下拉时加载数据
   */
  useEffect(() => {
    if (open) {
      // 下拉打开时懒加载预设列表
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPresets()
    }
  }, [open, loadPresets])

  /**
   * 点击预设项，懒加载完整配置后应用
   */
  const handlePresetClick = async (preset: ConfigPresetMeta) => {
    try {
      // 按需加载完整的配置内容
      const config = await storage.getPresetConfig(preset.id)
      if (!config) {
        console.error('预设配置内容不存在')
        setOpen(false)
        return
      }

      // 构造完整的 ConfigPreset 对象
      const fullPreset: ConfigPreset = {
        ...preset,
        config,
      }

      await onApplyPreset(fullPreset)
      setOpen(false)
    } catch (error) {
      console.error('应用预设配置失败:', error)
      setOpen(false)
    }
  }

  const dropdownContent = (
    <PresetsDropdownContainer $isDark={isDark}>
      <PresetsDropdownList>
        {presetsList.length === 0 ? (
          <PresetsDropdownEmptyState>
            <PresetsDropdownEmptyIcon>📋</PresetsDropdownEmptyIcon>
            <div>暂无预设配置</div>
          </PresetsDropdownEmptyState>
        ) : (
          presetsList.map((preset) => (
            <PresetsDropdownItem
              key={preset.id}
              $isDark={isDark}
              $themeColor={themeColor}
              onClick={() => handlePresetClick(preset)}
            >
              <PresetsDropdownItemContent>
                <PresetsDropdownInfo>
                  <PresetsDropdownName>{preset.name}</PresetsDropdownName>
                  <PresetsDropdownTime>{formatTimeAgo(preset.timestamp)}</PresetsDropdownTime>
                </PresetsDropdownInfo>
              </PresetsDropdownItemContent>
            </PresetsDropdownItem>
          ))
        )}
      </PresetsDropdownList>
    </PresetsDropdownContainer>
  )

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
    >
      <Tooltip title="预设配置">
        <DrawerTitleButton
          size="small"
          type="text"
          icon={<ProfileOutlined />}
          aria-label="config-presets"
        >
          {showText && '预设'}
        </DrawerTitleButton>
      </Tooltip>
    </Dropdown>
  )
}
