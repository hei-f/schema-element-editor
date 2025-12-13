import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { FavoriteTag } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { Button, ConfigProvider, Input, Modal, Space, Tag } from 'antd'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

const TAG_COLORS = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
] as const

const EMPTY_TAGS: FavoriteTag[] = []

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 8px;
`

const ColorBox = styled.div<{ $selected: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => (props.$selected ? '#1677ff' : '#f0f0f0')};
  background: ${(props) => (props.$selected ? '#f0f8ff' : '#fff')};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    border-color: #1677ff;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
  }
`

const StyledTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  margin: 0;
`

const PreviewSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
`

const PreviewLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`

const StyledButton = styled(Button)<{
  $themeColor: string
  $hoverColor: string
  $activeColor: string
}>`
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    background: ${(props) => props.$themeColor} !important;
    border-color: ${(props) => props.$themeColor} !important;
    color: #ffffff !important;

    &:hover {
      background: ${(props) => props.$hoverColor} !important;
      border-color: ${(props) => props.$hoverColor} !important;
      color: #ffffff !important;
    }

    &:active {
      background: ${(props) => props.$activeColor} !important;
      border-color: ${(props) => props.$activeColor} !important;
      color: #ffffff !important;
    }
  }
`

interface AddTagModalProps {
  visible: boolean
  existingTags?: FavoriteTag[]
  themeColor: string
  onAdd: (tag: FavoriteTag) => void
  onClose: () => void
}

/**
 * 添加标签弹窗组件
 */
export const AddTagModal: React.FC<AddTagModalProps> = ({
  visible,
  existingTags = EMPTY_TAGS,
  themeColor,
  onAdd,
  onClose,
}) => {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState<string>(TAG_COLORS[0])
  const [error, setError] = useState('')

  const { modalTheme, primaryColor, hoverColor, activeColor } = useMemo(() => {
    const colors = generate(themeColor)
    const primaryColor = colors[5]
    const hoverColor = colors[4]
    const activeColor = colors[6]

    return {
      primaryColor,
      hoverColor,
      activeColor,
      modalTheme: {
        token: {
          colorPrimary: primaryColor,
          colorPrimaryHover: hoverColor,
          colorPrimaryActive: activeColor,
          colorInfo: primaryColor,
          colorLink: primaryColor,
          colorLinkHover: hoverColor,
          colorLinkActive: activeColor,
          colorTextLightSolid: '#ffffff',
        },
        components: {
          Modal: {
            contentBg: '#ffffff',
            headerBg: '#ffffff',
          },
        },
      },
    }
  }, [themeColor])

  const handleClose = () => {
    setLabel('')
    setColor(TAG_COLORS[0])
    setError('')
    onClose()
  }

  const handleAdd = () => {
    const trimmedLabel = label.trim()

    if (!trimmedLabel) {
      setError('请输入标签名称')
      return
    }

    if (trimmedLabel.length > 10) {
      setError('标签名称不能超过10个字符')
      return
    }

    if (existingTags.some((tag) => tag.label === trimmedLabel)) {
      setError('标签名称已存在')
      return
    }

    onAdd({ label: trimmedLabel, color })
    handleClose()
  }

  return (
    <ConfigProvider theme={modalTheme} prefixCls="see">
      <Modal
        title="添加标签"
        open={visible}
        onCancel={handleClose}
        footer={
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <StyledButton
              type="primary"
              onClick={handleAdd}
              $themeColor={primaryColor}
              $hoverColor={hoverColor}
              $activeColor={activeColor}
            >
              确定
            </StyledButton>
          </Space>
        }
        width={400}
        getContainer={shadowRootManager.getContainer}
        zIndex={MODAL_Z_INDEX}
      >
        <div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>标签名称</label>
          </div>
          <Input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value)
              setError('')
            }}
            placeholder="请输入标签名称（最多10个字符）"
            maxLength={10}
            status={error ? 'error' : ''}
          />
          {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>选择颜色</label>
          </div>
          <ColorGrid>
            {TAG_COLORS.map((c) => (
              <ColorBox key={c} $selected={color === c} onClick={() => setColor(c)}>
                <StyledTag color={c}>示例</StyledTag>
              </ColorBox>
            ))}
          </ColorGrid>
        </div>

        <PreviewSection>
          <PreviewLabel>预览效果：</PreviewLabel>
          <StyledTag color={color}>{label || '标签名称'}</StyledTag>
        </PreviewSection>
      </Modal>
    </ConfigProvider>
  )
}
