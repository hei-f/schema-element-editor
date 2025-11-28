import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Alert, Card, Collapse, Flex, Form, Input, InputNumber, Typography } from 'antd'
import styled from 'styled-components'

const { Text, Title, Paragraph } = Typography

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  background: #fff;
  min-height: 100vh;
`

export const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

export const CodeBlock = styled.pre`
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #24292f;
  margin: 0;

  /* 注释样式 */
  .comment {
    color: #6a737d;
    font-style: italic;
  }

  /* HTML标签 */
  .tag {
    color: #22863a;
  }

  /* 属性名 */
  .attr-name {
    color: #6f42c1;
  }

  /* 属性值 */
  .attr-value {
    color: #032f62;
  }

  /* 关键字 */
  .keyword {
    color: #d73a49;
    font-weight: 500;
  }

  /* 函数名 */
  .function {
    color: #6f42c1;
  }

  /* 字符串 */
  .string {
    color: #032f62;
  }
`

export const HeaderSection = styled(Flex)`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const HeaderContent = styled.div`
  flex: 1;
`

export const HeaderActions = styled(Flex)`
  flex-shrink: 0;
`

export const VersionTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
`

/** SectionCard 面板标题容器 */
export const PanelHeader = styled(Flex)`
  width: 100%;
`

/** SectionCard 面板标题文本 */
export const PanelTitle = styled(Typography.Text)`
  font-weight: 600;
  font-size: 14px;
`

/** SectionCard 操作按钮组 */
export const PanelActions = styled(Flex)``

/** SectionCard 操作按钮 */
export const PanelActionButton = styled.button<{ $variant?: 'default' | 'primary' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }
  `
      : `
    background: #fff;
    color: #666;
    border: 1px solid #d9d9d9;
    
    &:hover {
      color: #1890ff;
      border-color: #1890ff;
    }
    
    &:active {
      color: #096dd9;
      border-color: #096dd9;
    }
  `}
`

export const AutoSaveHint = styled(Flex)`
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #1e40af;

  .anticon {
    font-size: 16px;
    color: #3b82f6;
  }

  .ant-btn-link {
    margin-left: auto;
    padding: 0;
    height: auto;
  }
`

export const PageTitle = styled(Title)`
  &.ant-typography {
    margin-bottom: 8px;
  }
`

export const PageDescription = styled(Paragraph)`
  &.ant-typography {
    margin-bottom: 0;
  }
`

export const SectionTitle = styled(Title)<{ $noMarginTop?: boolean }>`
  &.ant-typography {
    margin-top: ${(props) => (props.$noMarginTop ? '0' : '24px')};
    margin-bottom: 16px;
  }
`

export const SectionSubTitle = styled(Title)`
  &.ant-typography {
    margin-top: 24px;
    margin-bottom: 16px;
  }
`

export const StyledCollapse = styled(Collapse)`
  margin-top: 24px;
  margin-bottom: 24px;

  /* 折叠面板头部样式 */
  .ant-collapse-header {
    /* 防止标题被选中 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    /* 确保箭头图标和标题垂直居中对齐 */
    align-items: center !important;
  }

  /* 确保箭头图标垂直居中 */
  .ant-collapse-expand-icon {
    display: flex;
    align-items: center;
    height: auto !important;
    padding-inline-end: 12px !important;
  }

  /* 确保 header 内容区域占满剩余空间 */
  .ant-collapse-header-text {
    flex: 1;
  }
`

export const HelpIcon = styled(InfoCircleOutlined)`
  color: #1890ff;
  cursor: help;
`

export const ExampleSection = styled.div`
  margin-top: 24px;
`

export const ExampleLabel = styled(Text)`
  &.ant-typography {
    display: block;
    margin-bottom: 12px;
  }
`

export const SchemaNote = styled(Paragraph)`
  &.ant-typography {
    margin-top: 12px;
  }
`

/**
 * 配置卡片副标题
 */
export const CardSubtitle = styled(Text)`
  &.ant-typography {
    display: block;
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 16px;
  }
`

/**
 * 卡片标题容器（带 emoji）
 */
export const CardTitleContainer = styled(Flex)`
  font-size: 16px;
  font-weight: 600;
`

/**
 * 配置区块分隔线（用于卡片内小标题上方）
 */
export const SectionDivider = styled.div`
  height: 1px;
  background: #f0f0f0;
  margin: 24px 0 16px;
`

/**
 * 表单区块子标题
 * 用于表单内部分组的标签，加粗样式
 */
export const FormSectionLabel = styled.div<{ $noMarginTop?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin: ${(props) => (props.$noMarginTop ? '0' : '24px')} 0 16px;
`

/**
 * 横向表单行容器
 * 用于将标签、输入框、帮助图标等元素横向排列
 */
export const InlineFormRow = styled(Flex)``

/**
 * 可换行表单容器
 * 用于多个表单项的网格布局，支持自动换行
 */
export const FormRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 32px;
`

/**
 * 不可选中的表单标签
 * 用于表单项前的文本标签，防止用户选中文本
 */
export const FormLabel = styled.span`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

/**
 * 零边距Form.Item
 * 用于内联表单项，移除默认的下边距
 */
export const ZeroMarginFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0;
  }
`

/**
 * 帮助提示图标
 * 用于表单项旁的帮助说明，带悬停效果
 */
export const HelpTooltipIcon = styled(QuestionCircleOutlined)`
  color: #999;
  cursor: pointer;

  &:hover {
    color: #666;
  }
`

/**
 * 固定宽度输入框
 * 支持通过 $width 属性自定义宽度
 */
export const FixedWidthInput = styled(Input)<{ $width?: number }>`
  width: ${(props) => props.$width || 100}px;
`

/**
 * 固定宽度数字输入框
 * 支持通过 $width 属性自定义宽度
 */
export const FixedWidthInputNumber = styled(InputNumber)<{ $width?: number }>`
  width: ${(props) => props.$width || 100}px;
`

/**
 * 带可配置间距的Alert
 * 支持通过 $marginTop 和 $marginBottom 属性自定义上下间距
 */
export const SpacedAlert = styled(Alert)<{ $marginTop?: number; $marginBottom?: number }>`
  ${(props) => (props.$marginTop ? `margin-top: ${props.$marginTop}px;` : '')}
  ${(props) => (props.$marginBottom ? `margin-bottom: ${props.$marginBottom}px;` : '')}
`
