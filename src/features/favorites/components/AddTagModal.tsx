import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { FavoriteTag } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { ConfigProvider, Input, Modal, Space } from 'antd'
import React, { useMemo, useState } from 'react'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'
import {
  ErrorText,
  FavoriteModalTag,
  FormItem,
  FormLabel,
  FormSection,
  TagColorBox,
  TagColorGrid,
  TagPreviewLabel,
  TagPreviewSection,
} from '../styles/modals.styles'

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
  const [color, setColor] = useState<(typeof TAG_COLORS)[number]>(TAG_COLORS[0])
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
        cssVar: { prefix: 'see' },
        token: {
          colorPrimary: primaryColor,
          colorPrimaryHover: hoverColor,
          colorPrimaryActive: activeColor,
          colorInfo: primaryColor,
          colorLink: primaryColor,
          colorLinkHover: hoverColor,
          colorLinkActive: activeColor,
          colorTextLightSolid: '#ffffff',
          colorBgSolid: primaryColor,
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
            <ModalFooterButton onClick={handleClose}>取消</ModalFooterButton>
            <ModalFooterButton
              type="primary"
              onClick={handleAdd}
              $themeColor={primaryColor}
              $hoverColor={hoverColor}
              $activeColor={activeColor}
            >
              确定
            </ModalFooterButton>
          </Space>
        }
        width={400}
        getContainer={shadowRootManager.getContainer}
        zIndex={MODAL_Z_INDEX}
      >
        <div>
          <FormItem>
            <FormLabel>标签名称</FormLabel>
          </FormItem>
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
          {error && <ErrorText>{error}</ErrorText>}
        </div>

        <FormSection>
          <FormItem>
            <FormLabel>选择颜色</FormLabel>
          </FormItem>
          <TagColorGrid>
            {TAG_COLORS.map((c) => (
              <TagColorBox
                key={c}
                $selected={color === c}
                onClick={() => setColor(c)}
                data-testid={`color-box-${c}`}
              >
                <FavoriteModalTag color={c}>示例</FavoriteModalTag>
              </TagColorBox>
            ))}
          </TagColorGrid>
        </FormSection>

        <TagPreviewSection>
          <TagPreviewLabel>预览效果：</TagPreviewLabel>
          <FavoriteModalTag color={color} data-testid="preview-tag">
            {label || '标签名称'}
          </FavoriteModalTag>
        </TagPreviewSection>
      </Modal>
    </ConfigProvider>
  )
}
