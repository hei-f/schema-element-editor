import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import { generate } from '@ant-design/colors'
import { ConfigProvider, Input, Modal, Space } from 'antd'
import React, { useMemo } from 'react'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'

interface AddPresetModalProps {
  visible: boolean
  presetNameInput: string
  themeColor: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onClose: () => void
}

/**
 * 添加预设配置模态框组件
 */
export const AddPresetModal: React.FC<AddPresetModalProps> = ({
  visible,
  presetNameInput,
  themeColor,
  onInputChange,
  onAdd,
  onClose,
}) => {
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

  return (
    <ConfigProvider theme={modalTheme} prefixCls="see">
      <Modal
        title="保存为预设配置"
        open={visible}
        onCancel={onClose}
        footer={
          <Space>
            <ModalFooterButton onClick={onClose}>取消</ModalFooterButton>
            <ModalFooterButton
              type="primary"
              onClick={onAdd}
              $themeColor={primaryColor}
              $hoverColor={hoverColor}
              $activeColor={activeColor}
            >
              保存
            </ModalFooterButton>
          </Space>
        }
        zIndex={MODAL_Z_INDEX}
      >
        <Input
          placeholder="请输入预设配置名称（不超过50字符）"
          value={presetNameInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
          maxLength={50}
          onPressEnter={onAdd}
        />
      </Modal>
    </ConfigProvider>
  )
}
