import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { Button, Segmented, Tooltip } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { 
  AttributeTag, 
  AttributeTagWrapper,
  ButtonGroup, 
  CopyIconWrapper,
  ParamItem, 
  ParamLabel, 
  ParamsContainer, 
  StyledCopyIcon,
  EditorToolbar as StyledEditorToolbar 
} from '../styles/toolbar.styles'

interface DrawerToolbarProps {
  attributes: ElementAttributes
  contentType: ContentType
  canParse: boolean
  toolbarButtons: ToolbarButtonsConfig
  previewEnabled?: boolean
  onFormat: () => void
  onSerialize: () => void
  onDeserialize: () => void
  onSegmentChange: (value: string | number) => void
  onRenderPreview?: () => void
}

/**
 * 抽屉工具栏组件
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = ({
  attributes,
  contentType,
  canParse,
  toolbarButtons,
  previewEnabled = false,
  onFormat,
  onSerialize,
  onDeserialize,
  onSegmentChange,
  onRenderPreview
}) => {
  // 复制状态管理: { [index: number]: 'idle' | 'copied' }
  const [copyStatus, setCopyStatus] = useState<Record<number, 'idle' | 'copied'>>({})

  /**
   * 处理复制操作
   */
  const handleCopy = async (param: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(param)
      
      // 设置为已复制状态
      setCopyStatus(prev => ({ ...prev, [index]: 'copied' }))
      
      // 2秒后恢复为idle状态
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [index]: 'idle' }))
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <StyledEditorToolbar>
      <ParamsContainer>
        {attributes.params && attributes.params.length > 0 && (
          <>
            {attributes.params.map((param: string, index: number) => (
              <ParamItem key={index}>
                <ParamLabel>params{index + 1}:</ParamLabel>
                <Tooltip title={param} placement="topLeft">
                  <AttributeTagWrapper>
                    <AttributeTag>{param}</AttributeTag>
                    <CopyIconWrapper 
                      className="copy-icon-wrapper"
                      onClick={(e) => handleCopy(param, index, e)}
                    >
                      <StyledCopyIcon $isSuccess={copyStatus[index] === 'copied'}>
                        {copyStatus[index] === 'copied' ? (
                          <CheckOutlined />
                        ) : (
                          <CopyOutlined />
                        )}
                      </StyledCopyIcon>
                    </CopyIconWrapper>
                  </AttributeTagWrapper>
                </Tooltip>
              </ParamItem>
            ))}
          </>
        )}
      </ParamsContainer>
      <ButtonGroup>
        {previewEnabled && onRenderPreview && (
          <Button 
            size="small" 
            type="primary"
            onClick={onRenderPreview}
          >
            更新预览
          </Button>
        )}
        {toolbarButtons.astRawStringToggle && (
          <Tooltip 
            title={contentType === ContentType.Other ? '当前数据类型错误' : ''}
          >
            <Segmented
              size="small"
              shape="round"
              options={[
                { label: 'AST', value: ContentType.Ast },
                { label: 'RawString', value: ContentType.RawString }
              ]}
              value={contentType === ContentType.Other ? undefined : contentType}
              onChange={onSegmentChange}
              disabled={contentType === ContentType.Other}
            />
          </Tooltip>
        )}
        {toolbarButtons.deserialize && (
          <Button 
            size="small" 
            onClick={onDeserialize}
            disabled={!canParse}
          >
            反序列化
          </Button>
        )}
        {toolbarButtons.serialize && (
          <Button 
            size="small" 
            onClick={onSerialize}
            disabled={!canParse}
          >
            序列化
          </Button>
        )}
        {toolbarButtons.format && (
          <Button 
            size="small" 
            onClick={onFormat}
            disabled={!canParse}
          >
            格式化
          </Button>
        )}
      </ButtonGroup>
    </StyledEditorToolbar>
  )
}

