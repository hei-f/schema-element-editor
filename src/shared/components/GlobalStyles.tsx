import { createGlobalStyle } from 'styled-components'

/**
 * Shadow DOM 全局样式修复
 *
 * 用于修复 Shadow DOM 环境中的样式问题
 * 注意：这些样式只在 Shadow DOM 内生效，不会影响宿主页面
 */
export const GlobalStyles = createGlobalStyle`
  /* ========================================
   * Message 组件 Icon 颜色修复
   * ========================================
   * 问题：全局的 .anticon { color: inherit } 样式覆盖了 Message 组件的 icon 颜色
   * 解决：使用更高优先级的选择器强制设置正确的颜色
   */

  /* Success Message Icon - 绿色 */
  .see-message .see-message-notice-wrapper .see-message-success > .anticon {
    color: var(--see-color-success) !important;
  }

  /* Error Message Icon - 红色 */
  .see-message .see-message-notice-wrapper .see-message-error > .anticon {
    color: var(--see-color-error) !important;
  }

  /* Warning Message Icon - 橙色 */
  .see-message .see-message-notice-wrapper .see-message-warning > .anticon {
    color: var(--see-color-warning) !important;
  }

  /* Info Message Icon - 主题色 */
  .see-message .see-message-notice-wrapper .see-message-info > .anticon {
    color: var(--see-color-info) !important;
  }

  /* Loading Message Icon - 主题色 */
  .see-message .see-message-notice-wrapper .see-message-loading > .anticon {
    color: var(--see-color-primary) !important;
  }

  /* ========================================
   * 在此添加其他全局样式修复
   * ======================================== */
`
