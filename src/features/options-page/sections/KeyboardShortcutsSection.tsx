import { FORM_PATHS } from '@/shared/constants/form-paths'
import { formatShortcut } from '@/shared/constants/keyboard-shortcuts'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { ShortcutKey } from '@/shared/types'
import { Alert, Form } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { SectionCard } from '../components/SectionCard'
import { ShortcutInput } from '../components/ShortcutInput'

/** 快捷键符号样式（调整垂直对齐） */
const ShortcutText = styled.span`
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
`

/** 生成带样式的 extra 说明 */
const renderExtra = (description: string, defaultShortcut: ShortcutKey) => (
  <>
    {description}（默认：<ShortcutText>{formatShortcut(defaultShortcut)}</ShortcutText>）
  </>
)

interface KeyboardShortcutsSectionProps {
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 快捷键配置区块
 * 配置 Schema 编辑器抽屉内的快捷键
 */
export const KeyboardShortcutsSection: React.FC<KeyboardShortcutsSectionProps> = (props) => {
  const { isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="快捷键配置"
      subtitle="配置 Schema 编辑器内的快捷键"
      panelKey="keyboard-shortcuts"
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="保存"
        name={FORM_PATHS.drawerShortcuts.save}
        extra={renderExtra('保存当前编辑内容', DEFAULT_VALUES.drawerShortcuts.save)}
      >
        <ShortcutInput
          placeholder="录入保存快捷键"
          defaultValue={DEFAULT_VALUES.drawerShortcuts.save}
        />
      </Form.Item>

      <Form.Item
        label="格式化"
        name={FORM_PATHS.drawerShortcuts.format}
        extra={renderExtra('格式化 JSON 内容', DEFAULT_VALUES.drawerShortcuts.format)}
      >
        <ShortcutInput
          placeholder="录入格式化快捷键"
          defaultValue={DEFAULT_VALUES.drawerShortcuts.format}
        />
      </Form.Item>

      <Form.Item
        label="打开/更新预览"
        name={FORM_PATHS.drawerShortcuts.openOrUpdatePreview}
        extra={renderExtra(
          '打开预览或更新预览内容',
          DEFAULT_VALUES.drawerShortcuts.openOrUpdatePreview
        )}
      >
        <ShortcutInput
          placeholder="录入打开/更新预览快捷键"
          defaultValue={DEFAULT_VALUES.drawerShortcuts.openOrUpdatePreview}
        />
      </Form.Item>

      <Form.Item
        label="关闭预览"
        name={FORM_PATHS.drawerShortcuts.closePreview}
        extra={renderExtra('关闭预览面板', DEFAULT_VALUES.drawerShortcuts.closePreview)}
      >
        <ShortcutInput
          placeholder="录入关闭预览快捷键"
          defaultValue={DEFAULT_VALUES.drawerShortcuts.closePreview}
        />
      </Form.Item>

      <Alert
        message="快捷键说明"
        description={
          <div>
            <p>1. 点击输入框后直接按下想要的快捷键组合</p>
            <p>2. 快捷键必须包含 Ctrl/Cmd 或 Alt 修饰键</p>
            <p>3. 避免使用浏览器保留快捷键（如 Cmd+W、Cmd+T）</p>
            <p>4. 快捷键仅在编辑器获得焦点时生效</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </SectionCard>
  )
}
