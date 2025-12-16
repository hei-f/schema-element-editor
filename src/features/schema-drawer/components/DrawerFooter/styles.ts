import { Button } from 'antd'
import styled from 'styled-components'

/**
 * 抽屉底部按钮组（右对齐 + 间距）
 */
export const DrawerFooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

/**
 * 底部操作按钮
 * 圆角 + 内边距，primary 按钮支持通过props传递主题色
 */
export const FooterButton = styled(Button)<{
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
