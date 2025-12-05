import { Tooltip } from 'antd'
import React from 'react'
import { CopyIcon } from '@/shared/icons/drawer/toolbar/CopyIcon'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import {
  AttributeTagWrapper,
  CopyIconWrapper,
  StyledCopyIcon,
} from '../../styles/toolbar/toolbar.styles'

interface ParamTagProps {
  /** 参数值 */
  value: string
  /** 参数索引（用于显示 params 1, params 2 等） */
  index: number
  /** 复制成功回调 */
  onCopy?: () => void
}

/**
 * 使用原生 Clipboard API 复制文本到剪贴板
 * 与 antd6 内部实现方式一致
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return fallbackCopy(text)
    }
  }
  return fallbackCopy(text)
}

/**
 * 降级方案：使用 execCommand 复制
 * 用于不支持 Clipboard API 或非安全上下文的环境
 */
const fallbackCopy = (text: string): boolean => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'absolute'
  textArea.style.left = '-999999px'
  document.body.prepend(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    return true
  } catch {
    return false
  } finally {
    textArea.remove()
  }
}

/**
 * 单个参数标签组件
 * 显示参数标签，hover 展示参数值，支持复制功能
 */
export const ParamTag: React.FC<ParamTagProps> = (props) => {
  const { value, index, onCopy } = props

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await copyToClipboard(value)
    if (success) {
      onCopy?.()
    } else {
      console.error('复制失败')
    }
  }

  return (
    <Tooltip title={value} placement="bottom" getPopupContainer={shadowRootManager.getContainer}>
      <AttributeTagWrapper style={{ flexShrink: 0 }}>
        <span>params {index + 1}</span>
        <CopyIconWrapper onClick={handleCopy}>
          <StyledCopyIcon>
            <CopyIcon />
          </StyledCopyIcon>
        </CopyIconWrapper>
      </AttributeTagWrapper>
    </Tooltip>
  )
}
