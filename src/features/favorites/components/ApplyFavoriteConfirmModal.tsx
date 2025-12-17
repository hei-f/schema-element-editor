import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { ConfigProvider, Modal, Space } from 'antd'
import React, { useMemo } from 'react'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'

interface ApplyFavoriteConfirmModalProps {
  visible: boolean
  themeColor: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * 应用收藏确认弹窗组件
 */
export const ApplyFavoriteConfirmModal: React.FC<ApplyFavoriteConfirmModalProps> = ({
  visible,
  themeColor,
  onConfirm,
  onCancel,
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
        title="确认应用收藏"
        open={visible}
        onCancel={onCancel}
        footer={
          <Space>
            <ModalFooterButton onClick={onCancel}>取消</ModalFooterButton>
            <ModalFooterButton
              type="primary"
              onClick={onConfirm}
              $themeColor={primaryColor}
              $hoverColor={hoverColor}
              $activeColor={activeColor}
            >
              应用
            </ModalFooterButton>
          </Space>
        }
        getContainer={shadowRootManager.getContainer}
        zIndex={MODAL_Z_INDEX}
      >
        当前内容未保存，应用收藏将替换当前内容，确认吗？
      </Modal>
    </ConfigProvider>
  )
}
