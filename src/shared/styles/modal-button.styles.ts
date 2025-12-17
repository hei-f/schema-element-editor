import { Button } from 'antd'
import styled from 'styled-components'

/**
 * Modal Footer 按钮
 * 统一的圆角 + 内边距，支持主题色
 * 在所有 Modal/Drawer 的 footer 中使用
 */
export const ModalFooterButton = styled(Button)<{
  $themeColor?: string
  $hoverColor?: string
  $activeColor?: string
}>`
  &.see-btn {
    border-radius: 16px;
    padding: 4px 12px;
  }

  /* primary 按钮使用主题色（仅非禁用状态） */
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    background: ${(props) => props.$themeColor || '#1677ff'} !important;
    border-color: ${(props) => props.$themeColor || '#1677ff'} !important;
    color: #ffffff !important;

    &:hover {
      background: ${(props) => props.$hoverColor || '#4096ff'} !important;
      border-color: ${(props) => props.$hoverColor || '#4096ff'} !important;
      color: #ffffff !important;
    }

    &:active {
      background: ${(props) => props.$activeColor || '#0958d9'} !important;
      border-color: ${(props) => props.$activeColor || '#0958d9'} !important;
      color: #ffffff !important;
    }
  }
`
