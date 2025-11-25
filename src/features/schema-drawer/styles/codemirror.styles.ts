import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { styled } from 'styled-components'

/**
 * 编辑器容器样式
 */
export const EditorWrapper = styled.div<{ $height?: string; $isDark?: boolean }>`
  height: ${props => props.$height || '100%'};
  overflow: auto;
  
  .cm-editor {
    height: 100%;
    font-size: 16px;
    font-family: Monaco, Menlo, Consolas, monospace;
  }
  
  .cm-scroller {
    overflow: auto;
  }
  
  .cm-content {
    padding: 4px 0;
  }
  
  .cm-line {
    padding: 0 4px;
  }
  
  /* 折叠图标样式 */
  .cm-foldGutter {
    width: 16px;
  }
  
  .cm-foldPlaceholder {
    background-color: #eee;
    border: 1px solid #ddd;
    color: #222;
    border-radius: 3px;
    padding: 0 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  /* 行号样式 */
  .cm-gutters {
    background-color: #f5f5f5;
    border-right: 1px solid #ddd;
    color: #999;
  }
  
  /* 光标和选中样式 */
  .cm-cursor {
    border-left-color: #528bff;
  }
  
  .cm-selectionBackground {
    background-color: #d7d4f0 !important;
  }
  
  /* 括号匹配高亮 - 仅为 light 主题设置，深色主题由各主题文件自行定义 */
  ${props => !props.$isDark && `
    .cm-matchingBracket {
      background-color: #d0f0d0;
      outline: 1px solid #0b0;
    }
    
    .cm-nonmatchingBracket {
      background-color: #f0d0d0;
      outline: 1px solid #b00;
    }
  `}
  
  /* Linting 错误样式 */
  .cm-lintRange-error {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23d11' fill='none' stroke-width='1'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-position: bottom left;
    padding-bottom: 2px;
  }
  
  .cm-lintRange-warning {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23fa3' fill='none' stroke-width='1'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-position: bottom left;
    padding-bottom: 2px;
  }
  
  /* Lint Gutter 样式 */
  .cm-lintGutter {
    width: 1.4em;
  }
  
  .cm-lint-marker-error {
    color: #d11;
  }
  
  .cm-lint-marker-warning {
    color: #fa3;
  }
  
  /* 缩进引导线 */
  .cm-line {
    position: relative;
  }
  
  /* Placeholder 样式 */
  .cm-placeholder {
    color: #999;
    font-style: italic;
  }
  
  /* Tooltip 样式 */
  .cm-tooltip {
    background-color: #333;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .cm-tooltip-hover {
    background-color: #2c2c2c;
    border-color: #555;
  }
  
  /* 自动补全面板样式 */
  .cm-tooltip.cm-tooltip-autocomplete {
    background-color: #ffffff;
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    padding: 4px 0;
    max-height: 300px;
    overflow: hidden; /* 移除滚动条，让内部 ul 处理 */
  }
  
  /* 补全选项样式 */
  .cm-tooltip-autocomplete > ul {
    font-family: Monaco, Menlo, Consolas, monospace;
    font-size: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 292px; /* 略小于面板高度，避免出现滚动条 */
    overflow-y: auto;
  }
  
  .cm-tooltip-autocomplete > ul > li {
    padding: 6px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333;
  }
  
  /* 选中的补全项 */
  .cm-tooltip-autocomplete > ul > li[aria-selected] {
    background-color: #0066ff;
    color: #ffffff;
  }
  
  /* 补全项标签 */
  .cm-completionLabel {
    flex: 1;
    font-weight: 500;
  }
  
  /* 补全项详情 */
  .cm-completionDetail {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
  
  .cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail {
    color: rgba(255, 255, 255, 0.8);
  }
  
  /* 补全信息面板 */
  .cm-completionInfo {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    max-width: 320px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #333;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .cm-completionInfo.cm-completionInfo-right {
    margin-left: 8px;
  }
  
  .cm-completionInfo.cm-completionInfo-left {
    margin-right: 8px;
  }
  
  /* 补全项图标 */
  .cm-completionIcon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0.7;
  }
  
  .cm-completionIcon-property::before {
    content: "📝";
  }
  
  .cm-completionIcon-value::before {
    content: "💎";
  }
  
  .cm-completionIcon-keyword::before {
    content: "🔑";
  }
  
  .cm-completionIcon-type::before {
    content: "📋";
  }
  
  /* === 深色主题的补全面板样式 === */
  /* CodeMirror 在应用 dark 主题时会自动添加 .cm-dark 类 */
  .cm-editor.cm-dark ~ .cm-tooltip.cm-tooltip-autocomplete,
  .cm-dark .cm-tooltip.cm-tooltip-autocomplete {
    background-color: #252526;
    border: 1px solid #454545;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  .cm-editor.cm-dark ~ .cm-tooltip-autocomplete > ul > li,
  .cm-dark .cm-tooltip-autocomplete > ul > li {
    color: #cccccc;
  }
  
  .cm-editor.cm-dark ~ .cm-tooltip-autocomplete > ul > li[aria-selected],
  .cm-dark .cm-tooltip-autocomplete > ul > li[aria-selected] {
    background-color: #094771;
    color: #ffffff;
  }
  
  .cm-editor.cm-dark ~ .cm-tooltip-autocomplete .cm-completionDetail,
  .cm-dark .cm-completionDetail {
    color: #999;
  }
  
  .cm-editor.cm-dark ~ .cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail,
  .cm-dark .cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .cm-editor.cm-dark ~ .cm-completionInfo,
  .cm-dark .cm-completionInfo {
    background-color: #1e1e1e;
    border-color: #454545;
    color: #cccccc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
`

/**
 * 自定义语法高亮样式 - Light 主题
 * 为 JSON 提供更丰富的颜色方案
 */
export const jsonLightHighlight = HighlightStyle.define([
  // 属性名（key）- 深蓝色
  { tag: tags.propertyName, color: '#0451a5', fontWeight: 'bold' },
  // 字符串值 - 红棕色
  { tag: tags.string, color: '#a31515' },
  // 数字 - 深绿色
  { tag: tags.number, color: '#098658' },
  // 布尔值和 null - 蓝色
  { tag: tags.bool, color: '#0000ff', fontWeight: 'bold' },
  { tag: tags.null, color: '#0000ff', fontWeight: 'bold' },
  // 括号 - 不同类型不同颜色
  { tag: tags.brace, color: '#0431fa', fontWeight: 'bold' },         // {} 花括号 - 蓝色
  { tag: tags.squareBracket, color: '#319331', fontWeight: 'bold' }, // [] 方括号 - 绿色
  { tag: tags.paren, color: '#9400d3', fontWeight: 'bold' },         // () 圆括号 - 紫色
  // 逗号和冒号
  { tag: tags.separator, color: '#000000' },
  { tag: tags.punctuation, color: '#000000' },
  // 注释（虽然标准JSON不支持，但有些编辑器允许）
  { tag: tags.comment, color: '#008000', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#008000', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#008000', fontStyle: 'italic' },
])

/**
 * 自定义语法高亮样式 - Dark 主题
 */
export const jsonDarkHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: '#9cdcfe', fontWeight: 'bold' },
  { tag: tags.string, color: '#ce9178' },
  { tag: tags.number, color: '#b5cea8' },
  { tag: tags.bool, color: '#569cd6', fontWeight: 'bold' },
  { tag: tags.null, color: '#569cd6', fontWeight: 'bold' },
  // 括号 - 不同类型不同颜色
  { tag: tags.brace, color: '#ffd700', fontWeight: 'bold' },         // {} 花括号 - 金色
  { tag: tags.squareBracket, color: '#da70d6', fontWeight: 'bold' }, // [] 方括号 - 紫色
  { tag: tags.paren, color: '#87ceeb', fontWeight: 'bold' },         // () 圆括号 - 天蓝
  { tag: tags.separator, color: '#d4d4d4' },
  { tag: tags.punctuation, color: '#d4d4d4' },
  { tag: tags.comment, color: '#6a9955', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#6a9955', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#6a9955', fontStyle: 'italic' },
])

/**
 * 选中文本统计状态栏组件
 */
export const SelectionStats = styled.div`
  padding: 4px 12px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
  font-family: Monaco, Menlo, Consolas, monospace;
  display: flex;
  gap: 16px;
  
  &.dark {
    background-color: #1e1e1e;
    border-top-color: #333;
    color: #aaa;
  }
  
  .stat-item {
    display: flex;
    gap: 4px;
    
    .label {
      color: #999;
    }
    
    .value {
      font-weight: bold;
      color: #333;
    }
    
    &.dark .value {
      color: #ddd;
    }
  }
`

