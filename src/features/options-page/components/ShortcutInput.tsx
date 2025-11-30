import {
  formatShortcut,
  isBrowserReserved,
  isCodeMirrorConflict,
  shortcutFromEvent,
} from '@/shared/constants/keyboard-shortcuts'
import type { ShortcutKey } from '@/shared/types'
import { CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Tag, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

const ShortcutInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const ShortcutDisplayBox = styled.div<{ $isRecording: boolean; $hasWarning: boolean }>`
  min-width: 140px;
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${(props) => (props.$isRecording ? '#13c2c2' : props.$hasWarning ? '#faad14' : '#d9d9d9')};
  border-radius: 8px;
  background: ${(props) => (props.$isRecording ? '#e6fffb' : '#fafafa')};
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #13c2c2;
    background: ${(props) => (props.$isRecording ? '#e6fffb' : '#f0f5ff')};
  }

  &:focus {
    outline: none;
    border-color: #13c2c2;
    box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.15);
  }
`

const RecordingHintText = styled.span`
  color: #13c2c2;
  font-size: 13px;
  font-weight: 400;
`

const PlaceholderText = styled.span`
  color: #bfbfbf;
  font-size: 13px;
  font-weight: 400;
`

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const WarningTag = styled(Tag)`
  margin: 0;
  font-size: 12px;
`

interface ShortcutInputProps {
  /** 当前快捷键值 */
  value?: ShortcutKey
  /** 值变化回调 */
  onChange?: (value: ShortcutKey) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位文本 */
  placeholder?: string
  /** 默认值，用于重置 */
  defaultValue?: ShortcutKey
}

/**
 * 快捷键录入组件
 * 支持通过按键直接录入快捷键组合
 */
export const ShortcutInput: React.FC<ShortcutInputProps> = (props) => {
  const { value, onChange, disabled = false, placeholder = '点击录入快捷键', defaultValue } = props

  const [isRecording, setIsRecording] = useState(false)
  const [tempShortcut, setTempShortcut] = useState<ShortcutKey | null>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  /** 开始录入 */
  const startRecording = useCallback(() => {
    if (disabled) return
    setIsRecording(true)
    setTempShortcut(null)
  }, [disabled])

  /** 确认录入 */
  const confirmRecording = useCallback(() => {
    if (tempShortcut && !isBrowserReserved(tempShortcut)) {
      onChange?.(tempShortcut)
    }
    setIsRecording(false)
    setTempShortcut(null)
  }, [tempShortcut, onChange])

  /** 取消录入 */
  const cancelRecording = useCallback(() => {
    setIsRecording(false)
    setTempShortcut(null)
  }, [])

  /** 重置为默认值 */
  const resetToDefault = useCallback(() => {
    if (defaultValue) {
      onChange?.(defaultValue)
    }
  }, [defaultValue, onChange])

  /** 处理按键事件 */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isRecording) return

      event.preventDefault()
      event.stopPropagation()

      // Escape 取消录入
      if (event.key === 'Escape') {
        cancelRecording()
        return
      }

      // Enter 确认录入
      if (event.key === 'Enter' && tempShortcut) {
        confirmRecording()
        return
      }

      const shortcut = shortcutFromEvent(event)
      if (shortcut) {
        setTempShortcut(shortcut)
      }
    },
    [isRecording, tempShortcut, cancelRecording, confirmRecording]
  )

  /** 绑定键盘事件 */
  useEffect(() => {
    if (isRecording) {
      document.addEventListener('keydown', handleKeyDown, true)
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [isRecording, handleKeyDown])

  /** 获取显示内容 */
  const getDisplayContent = () => {
    const displayShortcut = isRecording && tempShortcut ? tempShortcut : value

    if (!displayShortcut || !displayShortcut.key) {
      if (isRecording) {
        return <RecordingHintText>按下快捷键...</RecordingHintText>
      }
      return <PlaceholderText>{placeholder}</PlaceholderText>
    }

    return formatShortcut(displayShortcut)
  }

  /** 检查是否有警告 */
  const displayShortcut = isRecording && tempShortcut ? tempShortcut : value
  const hasWarning = displayShortcut && displayShortcut.key && isCodeMirrorConflict(displayShortcut)
  const isReserved = displayShortcut && displayShortcut.key && isBrowserReserved(displayShortcut)

  /** 判断是否与默认值不同 */
  const isModified = useMemo(() => {
    if (!defaultValue || !value) return false
    return (
      value.key !== defaultValue.key ||
      value.ctrlOrCmd !== defaultValue.ctrlOrCmd ||
      value.shift !== defaultValue.shift ||
      value.alt !== defaultValue.alt
    )
  }, [value, defaultValue])

  return (
    <ShortcutInputContainer>
      <Tooltip
        title={
          isReserved ? '此快捷键被浏览器占用' : hasWarning ? '此快捷键可能与编辑器功能冲突' : null
        }
      >
        <ShortcutDisplayBox
          ref={inputRef}
          tabIndex={0}
          $isRecording={isRecording}
          $hasWarning={Boolean(hasWarning || isReserved)}
          onClick={isRecording ? undefined : startRecording}
        >
          {getDisplayContent()}
        </ShortcutDisplayBox>
      </Tooltip>

      {isRecording ? (
        <ActionButtonGroup>
          <Tooltip title="确认 (Enter)">
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={confirmRecording}
              disabled={!tempShortcut || Boolean(isReserved)}
              style={{ borderRadius: 6, background: '#13c2c2', borderColor: '#13c2c2' }}
            />
          </Tooltip>
          <Tooltip title="取消 (Esc)">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={cancelRecording}
              style={{ borderRadius: 6 }}
            />
          </Tooltip>
        </ActionButtonGroup>
      ) : (
        defaultValue && (
          <Tooltip title="重置为默认">
            <Button
              size="small"
              type="text"
              icon={<UndoOutlined />}
              onClick={resetToDefault}
              disabled={disabled || !isModified}
              style={{ borderRadius: 6, opacity: isModified ? 1 : 0.3 }}
            />
          </Tooltip>
        )
      )}

      {hasWarning && !isReserved && <WarningTag color="warning">可能冲突</WarningTag>}
      {isReserved && <WarningTag color="error">不可用</WarningTag>}
    </ShortcutInputContainer>
  )
}
