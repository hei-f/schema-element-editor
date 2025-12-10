import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { ApiOutlined } from '@ant-design/icons'
import { Form, Input, Space, Tooltip, Typography } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import {
  CodeBlock,
  ExampleLabel,
  ExampleSection,
  FixedWidthInputNumber,
  FormContent,
  FormSection,
  HelpTooltipIcon,
} from '../styles/layout.styles'
import type { SectionProps } from '../types'

const { Text } = Typography

/**
 * 集成配置区块
 * 整合属性配置和 postMessage API 配置
 */
export const IntegrationConfigSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange, onResetDefault } = props

  /** 通过 Form.useWatch 获取表单值 */
  const attributeName = Form.useWatch<string>(FORM_PATHS.attributeName)

  return (
    <SectionCard
      title="集成配置"
      subtitle="配置插件与宿主页面的通信方式和接口"
      icon={ApiOutlined}
      panelKey="integration-config"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      {/* 通用配置：属性名 */}
      <FormSection>
        <FormSectionLabelWithVariant id="field-attribute-name">
          元素标记配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                属性名称
                <Tooltip
                  title={`此属性名将用于从页面元素中提取参数，默认值为 ${DEFAULT_VALUES.attributeName}`}
                >
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.attributeName}
            rules={[
              { required: true, message: '请输入属性名称' },
              {
                pattern: /^[a-z][a-z0-9-]*$/,
                message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头',
              },
            ]}
          >
            <Input
              placeholder={`例如: ${DEFAULT_VALUES.attributeName}`}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Text type="secondary" style={{ display: 'block', marginTop: -8, marginBottom: 16 }}>
            实际使用的 HTML 属性为 <code>data-{attributeName ?? DEFAULT_VALUES.attributeName}</code>
          </Text>
        </FormContent>
      </FormSection>

      {/* postMessage 配置 */}
      <FormSection>
        <FormSectionLabelWithVariant id="field-request-timeout">
          postMessage 配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                请求超时时间
                <Tooltip title="发送请求后等待响应的最长时间">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.requestTimeout}
            rules={[
              { required: true, message: '请输入超时时间' },
              { type: 'number', min: 1, max: 30, message: '超时时间必须在 1-30 秒之间' },
            ]}
          >
            <FixedWidthInputNumber min={1} max={30} $width={120} suffix="秒" />
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-source-config">
          消息标识配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                插件端 source
                <Tooltip title="插件发送消息时使用的 source 标识">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.sourceConfig.contentSource}
            rules={[
              { required: true, message: '请输入插件端 source 标识' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                message: '只能包含字母、数字、连字符和下划线，且必须以字母开头',
              },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.sourceConfig.contentSource}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                宿主端 source
                <Tooltip title="宿主响应消息时使用的 source 标识">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.sourceConfig.hostSource}
            rules={[
              { required: true, message: '请输入宿主端 source 标识' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                message: '只能包含字母、数字、连字符和下划线，且必须以字母开头',
              },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.sourceConfig.hostSource}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-message-types">
          消息类型配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                获取 Schema
                <Tooltip title="获取 Schema 数据的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.getSchema}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.getSchema}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                更新 Schema
                <Tooltip title="更新 Schema 数据的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.updateSchema}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.updateSchema}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                检查预览
                <Tooltip title="检查预览函数是否存在的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.checkPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.checkPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                渲染预览
                <Tooltip title="渲染预览内容的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.renderPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.renderPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                清理预览
                <Tooltip title="清理预览内容的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.cleanupPreview}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                开始录制
                <Tooltip title="通知宿主开始录制的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.startRecording}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.startRecording}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                停止录制
                <Tooltip title="通知宿主停止录制的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.stopRecording}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.stopRecording}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                推送数据
                <Tooltip title="宿主推送录制数据给插件的消息类型">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.apiConfig.messageTypes.schemaPush}
            rules={[
              { required: true, message: '请输入消息类型' },
              { pattern: /^[A-Z][A-Z0-9_]*$/, message: '建议使用大写字母和下划线' },
            ]}
          >
            <Input
              placeholder={DEFAULT_VALUES.apiConfig.messageTypes.schemaPush}
              style={{ maxWidth: 300 }}
            />
          </Form.Item>
        </FormContent>
      </FormSection>

      <ExampleSection vertical gap={8}>
        <ExampleLabel strong>宿主页面集成示例（推荐使用 SDK）：</ExampleLabel>
        <CodeBlock>
          <span className="comment">{'// 安装: npm install @schema-element-editor/host-sdk'}</span>
          {'\n'}
          <span className="keyword">import</span> {'{ useSchemaElementEditor }'}{' '}
          <span className="keyword">from</span>{' '}
          <span className="string">'@schema-element-editor/host-sdk'</span>;{'\n\n'}
          <span className="keyword">function</span> <span className="function">App</span>() {'{'}
          {'\n'}
          {'  '}
          <span className="keyword">const</span> {'{ recording }'} ={' '}
          <span className="function">useSchemaElementEditor</span>({'{'}
          {'\n'}
          {'    '}
          <span className="comment">{'// 获取 schema（必填）'}</span>
          {'\n'}
          {'    '}getSchema: (params) =&gt; dataStore[params],{'\n'}
          {'    '}
          <span className="comment">{'// 更新 schema（必填）'}</span>
          {'\n'}
          {'    '}updateSchema: (schema, params) =&gt; {'{'}
          {'\n'}
          {'      '}dataStore[params] = schema;{'\n'}
          {'      '}
          <span className="keyword">return</span> <span className="keyword">true</span>;{'\n'}
          {'    }'},{'\n'}
          {'    '}
          <span className="comment">{'// 渲染预览（可选）'}</span>
          {'\n'}
          {'    '}renderPreview: (schema, containerId) =&gt; {'{'}
          {'\n'}
          {'      '}
          <span className="keyword">const</span> container ={' '}
          <span className="keyword">document</span>.<span className="function">getElementById</span>
          (containerId);{'\n'}
          {'      '}
          <span className="comment">{'// 渲染预览内容...'}</span>
          {'\n'}
          {'    }'},{'\n'}
          {'  }'});{'\n\n'}
          {'  '}
          <span className="comment">
            {'// 录制模式（可选）：推送数据以获得更好的性能，不配置则可以使用轮询模式'}
          </span>
          {'\n'}
          {'  '}sseHandler.onData = (params, data) =&gt;{' '}
          <span className="function">recording.push</span>(params, data);{'\n\n'}
          {'  '}
          <span className="keyword">return</span> &lt;div&gt;...&lt;/div&gt;;{'\n'}
          {'}'}
        </CodeBlock>
      </ExampleSection>
    </SectionCard>
  )
}
