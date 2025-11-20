import { storage } from '@/utils/storage'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Button, Card, Collapse, Form, Input, InputNumber, message, Space, Switch, Tooltip, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const { Title, Paragraph, Text } = Typography
const { Panel } = Collapse

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #fff;
  min-height: 100vh;
`

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const CodeBlock = styled.pre`
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  overflow-x: auto;
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const HeaderContent = styled.div`
  flex: 1;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
`

const VersionTag = styled.span`
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

/**
 * 设置页面组件
 */
export const OptionsApp: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [attributeName, setAttributeName] = useState('id')
  const [getFunctionName, setGetFunctionName] = useState('__getContentById')
  const [updateFunctionName, setUpdateFunctionName] = useState('__updateContentById')

  /**
   * 加载配置
   */
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const name = await storage.getAttributeName()
      const searchConfig = await storage.getSearchConfig()
      const getFn = await storage.getGetFunctionName()
      const updateFn = await storage.getUpdateFunctionName()
      const autoParse = await storage.getAutoParseString()
      const debugLog = await storage.getEnableDebugLog()
      
      setAttributeName(name)
      setGetFunctionName(getFn)
      setUpdateFunctionName(updateFn)
      form.setFieldsValue({ 
        attributeName: name,
        searchDepthDown: searchConfig.searchDepthDown,
        searchDepthUp: searchConfig.searchDepthUp,
        throttleInterval: searchConfig.throttleInterval,
        getFunctionName: getFn,
        updateFunctionName: updateFn,
        autoParseString: autoParse,
        enableDebugLog: debugLog
      })
    } catch (error) {
      message.error('加载配置失败')
    }
  }

  /**
   * 保存配置
   */
  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      await storage.setAttributeName(values.attributeName)
      await storage.setSearchConfig({
        searchDepthDown: values.searchDepthDown,
        searchDepthUp: values.searchDepthUp,
        throttleInterval: values.throttleInterval
      })
      await storage.setFunctionNames(values.getFunctionName, values.updateFunctionName)
      await storage.setAutoParseString(values.autoParseString)
      await storage.setEnableDebugLog(values.enableDebugLog)
      setAttributeName(values.attributeName)
      setGetFunctionName(values.getFunctionName)
      setUpdateFunctionName(values.updateFunctionName)
      message.success('设置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 重置为默认值
   */
  const handleReset = () => {
    form.setFieldsValue({ 
      attributeName: 'id',
      searchDepthDown: 5,
      searchDepthUp: 0,
      throttleInterval: 100,
      getFunctionName: '__getContentById',
      updateFunctionName: '__updateContentById',
      autoParseString: true,
      enableDebugLog: false
    })
  }

  /**
   * 检查更新
   */
  const handleCheckUpdate = () => {
    chrome.tabs.create({
      url: 'https://github.com/hei-f/schema-editor/releases/',
      active: true
    })
  }

  return (
    <Container>
      <HeaderSection>
        <HeaderContent>
          <Title level={2} style={{ marginBottom: '8px' }}>⚙️ Schema Editor 设置</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            配置插件的行为参数
          </Paragraph>
        </HeaderContent>
        <HeaderActions>
          <VersionTag>v1.0.8</VersionTag>
          <Button onClick={handleCheckUpdate}>
            检查更新
          </Button>
        </HeaderActions>
      </HeaderSection>

      <StyledCard title="参数属性名配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ 
            attributeName: 'id',
            searchDepthDown: 5,
            searchDepthUp: 0,
            throttleInterval: 100,
            getFunctionName: '__getContentById',
            updateFunctionName: '__updateContentById',
            autoParseString: true,
            enableDebugLog: false
          }}
        >
          <Form.Item
            label="属性名称"
            name="attributeName"
            rules={[
              { required: true, message: '请输入属性名称' },
              { pattern: /^[a-z][a-z0-9-]*$/, message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头' }
            ]}
            extra="此属性名将用于从页面元素中提取参数，默认值为 id"
          >
            <Input placeholder="例如: id" />
          </Form.Item>

          <Title level={5} style={{ marginTop: '24px', marginBottom: '16px' }}>API函数配置</Title>
              <Form.Item
                label="获取Schema函数名"
                name="getFunctionName"
                rules={[
                  { required: true, message: '请输入函数名' },
                  { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
                ]}
                extra="页面需要提供的获取Schema数据的全局函数名"
              >
                <Input placeholder="例如: __getContentById" />
              </Form.Item>

              <Form.Item
                label="更新Schema函数名"
                name="updateFunctionName"
                rules={[
                  { required: true, message: '请输入函数名' },
                  { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
                ]}
                extra="页面需要提供的更新Schema数据的全局函数名"
              >
                <Input placeholder="例如: __updateContentById" />
              </Form.Item>

          <Title level={5} style={{ marginTop: '24px', marginBottom: '16px' }}>搜索配置</Title>
              <Form.Item
                label="向下搜索深度"
                name="searchDepthDown"
                extra="查找子元素的最大层数，设置为 0 则不向下搜索"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="向上搜索深度"
                name="searchDepthUp"
                extra="查找父元素的最大层数，设置为 0 则不向上搜索"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="节流间隔 (毫秒)"
                name="throttleInterval"
                extra="控制鼠标移动检测频率，建议范围 8-200ms，较小值响应更快但可能影响性能"
              >
                <InputNumber min={8} style={{ width: '100%' }} />
          </Form.Item>

          <Collapse style={{ marginTop: '24px', marginBottom: '24px' }}>
            <Panel header="高级" key="advanced">
              <Form.Item
                label={
                  <Space>
                    字符串自动解析
                    <Tooltip title="开启后，当获取的Schema数据为字符串时，插件会自动将其解析为Markdown Elements结构。编辑完成后保存时，会将Elements结构转换回字符串。关闭则直接显示原始字符串。">
                      <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                    </Tooltip>
                  </Space>
                }
                name="autoParseString"
                valuePropName="checked"
                extra="自动将字符串类型的Schema数据解析为Markdown Elements结构进行编辑，保存时自动转换回字符串"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    启用调试日志
                    <Tooltip title="开启后，会在浏览器控制台输出插件的调试日志，如'注入成功'、'配置已同步'等信息。生产环境建议关闭。">
                      <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                    </Tooltip>
                  </Space>
                }
                name="enableDebugLog"
                valuePropName="checked"
                extra="在浏览器控制台显示插件的调试日志信息"
              >
                <Switch />
              </Form.Item>
            </Panel>
          </Collapse>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存设置
              </Button>
              <Button onClick={handleReset}>
                恢复默认
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px' }}>
          <Text strong>当前配置示例：</Text>
          <CodeBlock>
{`<!-- HTML元素属性 -->
<div data-${attributeName}="param1,param2,param3">
  点击此元素
</div>

<!-- 页面需要提供的全局函数 -->
<script>
  window.${getFunctionName} = function(params) {
    // params: "param1,param2,param3"
    return { your: 'schema' };
  };
  
  window.${updateFunctionName} = function(schema, params) {
    // schema: 修改后的数据
    // params: "param1,param2,param3"
    return true;
  };
</script>`}
          </CodeBlock>
        </div>
      </StyledCard>

      <StyledCard title="使用说明">
        <Paragraph>
          <ol>
            <li>
              在页面HTML元素上添加 <Text code>data-{attributeName}</Text> 属性
            </li>
            <li>
              属性值为逗号分隔的参数字符串，例如：<Text code>"value1,value2,value3"</Text>
            </li>
            <li>
              页面需要实现两个全局函数（函数名可在上方配置）：
              <ul>
                <li><Text code>window.{getFunctionName}(params)</Text> - 获取schema数据</li>
                <li><Text code>window.{updateFunctionName}(schema, params)</Text> - 更新schema数据</li>
              </ul>
            </li>
            <li>
              激活插件后，按住 <Text keyboard>Alt/Option</Text> 键悬停在元素上查看参数
            </li>
            <li>
              按住 <Text keyboard>Alt/Option</Text> 键并点击元素，打开编辑器修改schema
            </li>
          </ol>
        </Paragraph>
      </StyledCard>

      <StyledCard title="Schema类型支持">
        <Paragraph>
          Schema编辑器支持以下数据类型：
        </Paragraph>
        <ul>
          <li><Text strong>字符串 (String)</Text>: <Text code>"hello world"</Text></li>
          <li><Text strong>数字 (Number)</Text>: <Text code>123</Text> 或 <Text code>45.67</Text></li>
          <li><Text strong>对象 (Object)</Text>: <Text code>{`{"key": "value"}`}</Text></li>
          <li><Text strong>数组 (Array)</Text>: <Text code>[1, 2, 3]</Text></li>
          <li><Text strong>布尔值 (Boolean)</Text>: <Text code>true</Text> 或 <Text code>false</Text></li>
        </ul>
        <Paragraph type="secondary" style={{ marginTop: '12px' }}>
          注意：编辑器使用JSON格式，字符串值需要用引号包裹。null值不支持编辑。
        </Paragraph>
      </StyledCard>
    </Container>
  )
}

