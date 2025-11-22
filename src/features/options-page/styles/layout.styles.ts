import { InfoCircleOutlined } from '@ant-design/icons'
import { Card, Collapse, InputNumber, Typography } from 'antd'
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

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const HeaderContent = styled.div`
  flex: 1;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

export const AutoSaveHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
    margin-top: ${props => props.$noMarginTop ? '0' : '24px'};
    margin-bottom: 16px;
  }
`

export const SectionSubTitle = styled(Title)`
  &.ant-typography {
    margin-top: 24px;
    margin-bottom: 16px;
  }
`

export const FullWidthInputNumber = styled(InputNumber)`
  width: 100%;
`

export const StyledCollapse = styled(Collapse)`
  margin-top: 24px;
  margin-bottom: 24px;
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

