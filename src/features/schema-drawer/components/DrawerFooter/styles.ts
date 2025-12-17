import styled from 'styled-components'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'

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
 * 复用共享的 ModalFooterButton 样式
 */
export const FooterButton = ModalFooterButton
