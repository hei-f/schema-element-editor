import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import type { ApiConfig, CommunicationMode } from '@/shared/types'
import { Alert, Form, Input, Radio, Space, Typography } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import {
  CodeBlock,
  ExampleLabel,
  ExampleSection,
  FixedWidthInputNumber,
  FormSectionLabel,
} from '../styles/layout.styles'

const { Text } = Typography

interface IntegrationConfigSectionProps {
  /** 当前通信模式 */
  communicationMode: CommunicationMode
  /** 当前属性名 */
  attributeName: string
  /** 当前获取函数名（windowFunction 模式） */
  getFunctionName: string
  /** 当前更新函数名（windowFunction 模式） */
  updateFunctionName: string
  /** 当前预览函数名（windowFunction 模式） */
  previewFunctionName: string
  /** 当前 API 配置 */
  apiConfig: ApiConfig | null
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 集成配置区块
 * 整合通信模式、属性配置和 API 配置
 */
export const IntegrationConfigSection: React.FC<IntegrationConfigSectionProps> = (props) => {
  const {
    communicationMode,
    attributeName,
    getFunctionName,
    updateFunctionName,
    previewFunctionName,
    apiConfig,
    isActive,
    onActiveChange,
    onResetDefault,
  } = props

  return (
    <SectionCard
      title="集成配置"
      subtitle="配置插件与宿主页面的通信方式和接口"
      panelKey="integration-config"
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      {/* 通信模式选择 */}
      <Form.Item
        label="通信模式"
        name={FORM_PATHS.apiConfig.communicationMode}
        extra="选择扩展与页面的通信方式"
        id="field-communication-mode"
      >
        <Radio.Group>
          <Space orientation="vertical">
            <Radio value="postMessage">
              <Text strong>postMessage 模式</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                不污染 window，方法不会暴露
              </Text>
            </Radio>
            <Radio value="windowFunction">
              <Text strong>Window 函数模式</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                接入简单，宿主只需暴露方法
              </Text>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {/* 通用配置：属性名 */}
      <FormSectionLabel id="field-attribute-name">元素标记配置</FormSectionLabel>

      <Form.Item
        label="属性名称"
        name={FORM_PATHS.attributeName}
        rules={[
          { required: true, message: '请输入属性名称' },
          {
            pattern: /^[a-z][a-z0-9-]*$/,
            message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头',
          },
        ]}
        extra={`此属性名将用于从页面元素中提取参数，默认值为 ${DEFAULT_VALUES.attributeName}`}
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.attributeName}`} style={{ maxWidth: 300 }} />
      </Form.Item>

      {/* postMessage 模式配置 */}
      {communicationMode === 'postMessage' && (
        <>
          <FormSectionLabel id="field-request-timeout">postMessage 配置</FormSectionLabel>

          <Form.Item
            label="请求超时时间"
            name={FORM_PATHS.apiConfig.requestTimeout}
            rules={[
              { required: true, message: '请输入超时时间' },
              { type: 'number', min: 1, max: 30, message: '超时时间必须在 1-30 秒之间' },
            ]}
            extra="发送请求后等待响应的最长时间"
          >
            <FixedWidthInputNumber min={1} max={30} $width={120} suffix="秒" />
          </Form.Item>

          <FormSectionLabel id="field-source-config">消息标识配置</FormSectionLabel>

          <Form.Item
            label="插件端 source"
            name={FORM_PATHS.apiConfig.sourceConfig.contentSource}
            rules={[
              { required: true, message: '请输入插件端 source 标识' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                message: '只能包含字母、数字、连字符和下划线，且必须以字母开头',
              },
            ]}
            extra="插件发送消息时使用的 source 标识"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.sourceConfig.contentSource}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="宿主端 source"
            name={FORM_PATHS.apiConfig.sourceConfig.hostSource}
            rules={[
              { required: true, message: '请输入宿主端 source 标识' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                message: '只能包含字母、数字、连字符和下划线，且必须以字母开头',
              },
            ]}
            extra="宿主响应消息时使用的 source 标识"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.sourceConfig.hostSource}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <FormSectionLabel id="field-message-types">消息类型配置</FormSectionLabel>

          <Form.Item
            label="获取 Schema"
            name={FORM_PATHS.apiConfig.messageTypes.getSchema}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
            extra="获取 Schema 数据的消息类型"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.getSchema}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="更新 Schema"
            name={FORM_PATHS.apiConfig.messageTypes.updateSchema}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
            extra="更新 Schema 数据的消息类型"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.updateSchema}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="检查预览"
            name={FORM_PATHS.apiConfig.messageTypes.checkPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
            extra="检查预览函数是否存在的消息类型"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.checkPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="渲染预览"
            name={FORM_PATHS.apiConfig.messageTypes.renderPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
            extra="渲染预览内容的消息类型"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.renderPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="清理预览"
            name={FORM_PATHS.apiConfig.messageTypes.cleanupPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
            extra="清理预览内容的消息类型"
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <ExampleSection>
            <ExampleLabel strong>postMessage 模式 - 宿主页面示例：</ExampleLabel>
            <CodeBlock>
              <span className="comment">{'// 监听扩展请求'}</span>
              {'\n'}
              <span className="keyword">window</span>.
              <span className="function">addEventListener</span>(
              <span className="string">'message'</span>, (event) =&gt; {'{'}
              {'\n'}
              {'  '}
              <span className="keyword">if</span> (event.source !=={' '}
              <span className="keyword">window</span>) <span className="keyword">return</span>;
              {'\n'}
              {'  '}
              <span className="keyword">if</span> (event.data?.source !=={' '}
              <span className="string">
                '
                {apiConfig?.sourceConfig?.contentSource ??
                  DEFAULT_VALUES.apiConfig.sourceConfig.contentSource}
                '
              </span>
              ) <span className="keyword">return</span>;{'\n\n'}
              {'  '}
              <span className="keyword">const</span> {'{ type, payload, requestId }'} = event.data;
              {'\n'}
              {'  '}
              <span className="keyword">let</span> result;{'\n\n'}
              {'  '}
              <span className="keyword">switch</span> (type) {'{'}
              {'\n'}
              {'    '}
              <span className="keyword">case</span>{' '}
              <span className="string">
                '
                {apiConfig?.messageTypes?.getSchema ??
                  DEFAULT_VALUES.apiConfig.messageTypes.getSchema}
                '
              </span>
              :{'\n'}
              {'      '}result = {'{ success: true, data: getSchema(payload.params) }'};{'\n'}
              {'      '}
              <span className="keyword">break</span>;{'\n'}
              {'    '}
              <span className="keyword">case</span>{' '}
              <span className="string">
                '
                {apiConfig?.messageTypes?.updateSchema ??
                  DEFAULT_VALUES.apiConfig.messageTypes.updateSchema}
                '
              </span>
              :{'\n'}
              {'      '}result = {'{ success: updateSchema(payload.schema, payload.params) }'};
              {'\n'}
              {'      '}
              <span className="keyword">break</span>;{'\n'}
              {'    '}
              <span className="keyword">case</span>{' '}
              <span className="string">
                '
                {apiConfig?.messageTypes?.checkPreview ??
                  DEFAULT_VALUES.apiConfig.messageTypes.checkPreview}
                '
              </span>
              :{'\n'}
              {'      '}result = {'{ exists: true }'};{'\n'}
              {'      '}
              <span className="keyword">break</span>;{'\n'}
              {'    '}
              <span className="keyword">case</span>{' '}
              <span className="string">
                '
                {apiConfig?.messageTypes?.renderPreview ??
                  DEFAULT_VALUES.apiConfig.messageTypes.renderPreview}
                '
              </span>
              :{'\n'}
              {'      '}
              <span className="keyword">const</span> container ={' '}
              <span className="keyword">document</span>.
              <span className="function">getElementById</span>(payload.containerId);{'\n'}
              {'      '}renderPreview(payload.schema, container);{'\n'}
              {'      '}result = {'{ success: true }'};{'\n'}
              {'      '}
              <span className="keyword">break</span>;{'\n'}
              {'    '}
              <span className="keyword">case</span>{' '}
              <span className="string">
                '
                {apiConfig?.messageTypes?.cleanupPreview ??
                  DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview}
                '
              </span>
              :{'\n'}
              {'      '}cleanupPreview();{'\n'}
              {'      '}result = {'{ success: true }'};{'\n'}
              {'      '}
              <span className="keyword">break</span>;{'\n'}
              {'  }'}
              {'\n\n'}
              {'  '}
              <span className="comment">{'// 发送响应（必须携带 requestId）'}</span>
              {'\n'}
              {'  '}
              <span className="keyword">window</span>.<span className="function">postMessage</span>(
              {'{'}
              {'\n'}
              {'    '}source:{' '}
              <span className="string">
                '
                {apiConfig?.sourceConfig?.hostSource ??
                  DEFAULT_VALUES.apiConfig.sourceConfig.hostSource}
                '
              </span>
              ,{'\n'}
              {'    '}requestId,{'\n'}
              {'    '}...result{'\n'}
              {'  }'},<span className="string"> '*'</span>);{'\n'}
              {'}'});
            </CodeBlock>
          </ExampleSection>
        </>
      )}

      {/* Window 函数模式配置 */}
      {communicationMode === 'windowFunction' && (
        <>
          <Alert
            message="Window 函数模式已废弃"
            description="此模式将在未来版本中移除，建议迁移到 postMessage 模式。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <FormSectionLabel id="field-window-functions">核心 API（必需）</FormSectionLabel>

          <Form.Item
            label="获取Schema函数名"
            name={FORM_PATHS.getFunctionName}
            id="field-get-function"
            rules={[
              { required: true, message: '请输入函数名' },
              { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' },
            ]}
            extra="页面需要提供的获取Schema数据的全局函数名"
          >
            <Input
              placeholder={`例如: ${DEFAULT_VALUES.getFunctionName}`}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <Form.Item
            label="更新Schema函数名"
            name={FORM_PATHS.updateFunctionName}
            id="field-update-function"
            rules={[
              { required: true, message: '请输入函数名' },
              { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' },
            ]}
            extra="页面需要提供的更新Schema数据的全局函数名"
          >
            <Input
              placeholder={`例如: ${DEFAULT_VALUES.updateFunctionName}`}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <FormSectionLabel>扩展 API（可选）</FormSectionLabel>

          <Form.Item
            label="预览函数名"
            name={FORM_PATHS.previewFunctionName}
            id="field-preview-function"
            rules={[
              { required: true, message: '请输入函数名' },
              { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' },
            ]}
            extra="返回 React 组件用于实时预览，若页面未提供则预览功能不可用"
          >
            <Input
              placeholder={`例如: ${DEFAULT_VALUES.previewFunctionName}`}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>

          <ExampleSection>
            <ExampleLabel strong>Window 函数模式 - 宿主页面示例（已废弃）：</ExampleLabel>
            <CodeBlock>
              <span className="comment">&lt;!-- HTML元素属性 --&gt;</span>
              {'\n'}
              <span className="tag">&lt;div</span>{' '}
              <span className="attr-name">data-{attributeName}</span>=
              <span className="attr-value">"param1,param2"</span>
              <span className="tag">&gt;</span>
              {'\n'}
              {'  '}点击此元素{'\n'}
              <span className="tag">&lt;/div&gt;</span>
              {'\n\n'}
              <span className="comment">{'// 核心 API（必需）'}</span>
              {'\n'}
              <span className="keyword">window</span>.
              <span className="function">{getFunctionName}</span> = (params) =&gt; {'{'}
              {'\n'}
              {'  '}
              <span className="comment">{"// params: 'param1' 或 'param1,param2'"}</span>
              {'\n'}
              {'  '}
              <span className="keyword">return</span> getSchema(params);{'\n'}
              {'}'};{'\n\n'}
              <span className="keyword">window</span>.
              <span className="function">{updateFunctionName}</span> = (schema, params) =&gt; {'{'}
              {'\n'}
              {'  '}saveSchema(schema, params);{'\n'}
              {'  '}
              <span className="keyword">return</span> <span className="attr-value">true</span>;
              {'\n'}
              {'}'};{'\n\n'}
              <span className="comment">{'// 预览 API（可选）'}</span>
              {'\n'}
              <span className="keyword">let</span> previewRoot ={' '}
              <span className="attr-value">null</span>;{'\n'}
              <span className="keyword">window</span>.
              <span className="function">{previewFunctionName}</span> = (data, container) =&gt;{' '}
              {'{'}
              {'\n'}
              {'  '}
              <span className="keyword">if</span> (!previewRoot) {'{'}
              {'\n'}
              {'    '}previewRoot = ReactDOM.<span className="function">createRoot</span>
              (container);{'\n'}
              {'  }'}
              {'\n'}
              {'  '}previewRoot.<span className="function">render</span>({'<Preview data={data} />'}
              );{'\n'}
              {'  '}
              <span className="keyword">return</span> () =&gt; {'{'}
              {'\n'}
              {'    '}previewRoot?.<span className="function">unmount</span>();{'\n'}
              {'    '}previewRoot = <span className="attr-value">null</span>;{'\n'}
              {'  }'};{'\n'}
              {'}'};
            </CodeBlock>
          </ExampleSection>
        </>
      )}
    </SectionCard>
  )
}
