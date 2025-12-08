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
 * 圆角 + 内边距，primary 按钮使用 CSS 变量 --drawer-theme-color 作为主题色
 */
export const FooterButton = styled(Button)`
  &.see-btn {
    border-radius: 16px;
    padding: 4px 12px;
  }

  /* primary 按钮使用主题色（仅非禁用状态） */
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    background: var(--drawer-theme-color, #1677ff);
    color: #ffffff;

    &:hover {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #ffffff);
    }

    &:active {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #000000);
    }
  }
`
