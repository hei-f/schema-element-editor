import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { Button, Segmented, Tooltip } from 'antd'
import React from 'react'
import { AttributeTag, ButtonGroup, ParamItem, ParamLabel, ParamsContainer, EditorToolbar as StyledEditorToolbar } from '../styles/toolbar.styles'

interface DrawerToolbarProps {
  attributes: ElementAttributes
  contentType: ContentType
  canParse: boolean
  toolbarButtons: ToolbarButtonsConfig
  onFormat: () => void
  onSerialize: () => void
  onDeserialize: () => void
  onSegmentChange: (value: string | number) => void
}

/**
 * 抽屉工具栏组件
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = ({
  attributes,
  contentType,
  canParse,
  toolbarButtons,
  onFormat,
  onSerialize,
  onDeserialize,
  onSegmentChange
}) => {
  return (
    <StyledEditorToolbar>
      <ParamsContainer>
        {attributes.params && attributes.params.length > 0 && (
          <>
            {attributes.params.map((param: string, index: number) => (
              <ParamItem key={index}>
                <ParamLabel>params{index + 1}:</ParamLabel>
                <Tooltip title={param} placement="topLeft">
                  <AttributeTag>{param}</AttributeTag>
                </Tooltip>
              </ParamItem>
            ))}
          </>
        )}
      </ParamsContainer>
      <ButtonGroup>
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

