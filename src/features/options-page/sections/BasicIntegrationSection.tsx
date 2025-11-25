import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Input } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { CodeBlock, ExampleLabel, ExampleSection, FormSectionLabel } from '../styles/layout.styles'

interface BasicIntegrationSectionProps {
  /** 当前属性名（用于动态示例） */
  attributeName: string
  /** 当前获取函数名（用于动态示例） */
  getFunctionName: string
  /** 当前更新函数名（用于动态示例） */
  updateFunctionName: string
  /** 预览函数名（用于动态示例） */
  previewFunctionName: string
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 基础集成配置区块
 * 包含插件与页面对接的核心配置
 */
export const BasicIntegrationSection: React.FC<BasicIntegrationSectionProps> = (props) => {
  const { attributeName, getFunctionName, updateFunctionName, previewFunctionName, onResetDefault } = props

  return (
    <SectionCard
      title="基础集成配置"
      subtitle="配置插件与页面的对接方式"
      panelKey="basic-integration"
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="属性名称"
        name={FORM_PATHS.attributeName}
        rules={[
          { required: true, message: '请输入属性名称' },
          { pattern: /^[a-z][a-z0-9-]*$/, message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头' }
        ]}
        extra={`此属性名将用于从页面元素中提取参数，默认值为 ${DEFAULT_VALUES.attributeName}`}
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.attributeName}`} />
      </Form.Item>

      <FormSectionLabel>核心 API（必需）</FormSectionLabel>

      <Form.Item
        label="获取Schema函数名"
        name={FORM_PATHS.getFunctionName}
        rules={[
          { required: true, message: '请输入函数名' },
          { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
        ]}
        extra="页面需要提供的获取Schema数据的全局函数名"
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.getFunctionName}`} />
      </Form.Item>

      <Form.Item
        label="更新Schema函数名"
        name={FORM_PATHS.updateFunctionName}
        rules={[
          { required: true, message: '请输入函数名' },
          { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
        ]}
        extra="页面需要提供的更新Schema数据的全局函数名"
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.updateFunctionName}`} />
      </Form.Item>

      <FormSectionLabel>扩展 API（可选）</FormSectionLabel>

      <Form.Item
        label="预览函数名"
        name={FORM_PATHS.previewFunctionName}
        rules={[
          { required: true, message: '请输入函数名' },
          { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
        ]}
        extra="返回 React 组件用于实时预览，若页面未提供则预览功能不可用"
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.previewFunctionName}`} />
      </Form.Item>

      <ExampleSection>
        <ExampleLabel strong>当前配置示例：</ExampleLabel>
        <CodeBlock>
          <span className="comment">&lt;!-- HTML元素属性 --&gt;</span>{'\n'}
          <span className="tag">&lt;div</span> <span className="attr-name">data-{attributeName}</span>=<span className="attr-value">"param1,param2"</span><span className="tag">&gt;</span>{'\n'}
          {'  '}点击此元素{'\n'}
          <span className="tag">&lt;/div&gt;</span>{'\n\n'}
          <span className="comment">&lt;!-- 核心 API（必需） --&gt;</span>{'\n'}
          <span className="tag">&lt;script&gt;</span>{'\n'}
          {'  '}<span className="keyword">window</span>.<span className="function">{getFunctionName}</span> = <span className="keyword">function</span>(params) {'{'} ... {'}'};{'\n'}
          {'  '}<span className="keyword">window</span>.<span className="function">{updateFunctionName}</span> = <span className="keyword">function</span>(schema, params) {'{'} ... {'}'};{'\n\n'}
          {'  '}<span className="comment">// 扩展 API（可选）</span>{'\n'}
          {'  '}<span className="keyword">window</span>.<span className="function">{previewFunctionName}</span> = <span className="keyword">function</span>(data) {'{'} <span className="keyword">return</span> &lt;Preview data={'{'}data{'}'} /&gt;; {'}'};{'\n'}
          <span className="tag">&lt;/script&gt;</span>
        </CodeBlock>
      </ExampleSection>
    </SectionCard>
  )
}
