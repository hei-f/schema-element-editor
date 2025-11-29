import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React, { useState } from 'react'
import {
  AttributeTag,
  AttributeTagWrapper,
  CopyIconWrapper,
  ParamItem,
  ParamLabel,
  StyledCopyIcon,
} from '../../styles/toolbar/toolbar.styles'

interface ParamTagProps {
  /** 参数值 */
  value: string
  /** 参数索引（用于显示 params1, params2 等） */
  index: number
}

/**
 * 单个参数标签组件
 * 显示参数值，支持复制功能
 */
export const ParamTag: React.FC<ParamTagProps> = ({ value, index }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus('copied')
      setTimeout(() => {
        setCopyStatus('idle')
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <ParamItem style={{ flexShrink: 0 }}>
      <ParamLabel>params{index + 1}:</ParamLabel>
      <Tooltip title={value} placement="bottom">
        <AttributeTagWrapper>
          <AttributeTag>{value}</AttributeTag>
          <CopyIconWrapper className="copy-icon-wrapper" onClick={handleCopy}>
            <StyledCopyIcon $isSuccess={copyStatus === 'copied'}>
              {copyStatus === 'copied' ? <CheckOutlined /> : <CopyOutlined />}
            </StyledCopyIcon>
          </CopyIconWrapper>
        </AttributeTagWrapper>
      </Tooltip>
    </ParamItem>
  )
}
