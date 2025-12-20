import styled from 'styled-components'
import {
  ModernDropdownContainer,
  ModernDropdownEmpty,
  ModernDropdownEmptyIcon,
  ModernDropdownItem,
  ModernDropdownItemContent,
  ModernDropdownList,
} from '../shared/modern-dropdown.styles'

/**
 * 预设配置下拉容器
 * 继承现代化下拉样式
 */
export const PresetsDropdownContainer = styled(ModernDropdownContainer)`
  width: 260px;
  max-width: 90vw;
`

/**
 * 预设配置列表容器
 */
export const PresetsDropdownList = styled(ModernDropdownList)`
  max-height: 320px;
`

/**
 * 预设配置列表项
 * 继承现代化菜单项的交互效果
 */
export const PresetsDropdownItem = styled(ModernDropdownItem)`
  /* 预设配置特定样式 */
`

/**
 * 预设配置菜单项内容容器
 */
export const PresetsDropdownItemContent = styled(ModernDropdownItemContent)`
  gap: 12px;
`

/**
 * 预设配置信息容器
 * 水平布局：名称居左，时间居右
 */
export const PresetsDropdownInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

/**
 * 预设配置名称文本
 * 单行显示，超出省略
 */
export const PresetsDropdownName = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`

/**
 * 预设配置时间文本
 * 固定宽度，右对齐
 */
export const PresetsDropdownTime = styled.div`
  font-size: 12px;
  line-height: 20px;
  color: #8c8c8c;
  opacity: 0.5;
  white-space: nowrap;
  flex-shrink: 0;
`

/**
 * 预设配置下拉空状态容器
 */
export const PresetsDropdownEmptyState = styled(ModernDropdownEmpty)`
  /* 使用统一的空状态样式 */
`

/**
 * 空状态图标
 */
export const PresetsDropdownEmptyIcon = styled(ModernDropdownEmptyIcon)`
  /* 使用统一的空状态图标样式 */
`
