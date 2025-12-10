/**
 * 插件内部事件名称常量
 * 用于组件间通信的 CustomEvent 事件名
 */
export const PLUGIN_EVENTS = {
  /** 元素点击事件（主页面） */
  ELEMENT_CLICK: 'schema-element-editor:element-click',
  /** iframe 元素点击事件 */
  IFRAME_ELEMENT_CLICK: 'schema-element-editor:iframe-element-click',
  /** iframe 元素悬停事件 */
  IFRAME_ELEMENT_HOVER: 'schema-element-editor:iframe-element-hover',
  /** 清除高亮事件 */
  CLEAR_HIGHLIGHT: 'schema-element-editor:clear-highlight',
  /** 清除 iframe 高亮事件 */
  IFRAME_CLEAR_HIGHLIGHT: 'schema-element-editor:iframe-clear-highlight',
  /** iframe 批量高亮响应事件 */
  IFRAME_HIGHLIGHT_ALL_RESPONSE: 'schema-element-editor:iframe-highlight-all-response',
  /** 暂停监控事件 */
  PAUSE_MONITOR: 'schema-element-editor:pause-monitor',
  /** 恢复监控事件 */
  RESUME_MONITOR: 'schema-element-editor:resume-monitor',
  /** 录制模式变更事件 */
  RECORDING_MODE_CHANGE: 'schema-element-editor:recording-mode-change',
} as const
