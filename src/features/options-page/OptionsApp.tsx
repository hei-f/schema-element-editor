import { DEFAULT_VALUES, FORM_FIELD_NAMES } from '@/shared/constants/defaults'
import { storage } from '@/shared/utils/browser/storage'
import { CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Collapse, Form, Input, InputNumber, message, Slider, Space, Switch, Tooltip, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { ColorPickerField } from './components/ColorPickerField'
import { DEBOUNCE_FIELDS, FIELD_GROUPS, FIELD_STORAGE_MAP } from './config/field-config'
import {
  AutoSaveHint,
  CodeBlock,
  Container,
  ExampleLabel,
  ExampleSection,
  FullWidthInputNumber,
  HeaderActions,
  HeaderContent,
  HeaderSection,
  HelpIcon,
  PageDescription,
  PageTitle,
  SchemaNote,
  SectionSubTitle,
  SectionTitle,
  StyledCard,
  StyledCollapse,
  VersionTag
} from './styles/layout.styles'

const { Panel } = Collapse

/**
 * 打开GitHub Releases页面检查更新
 */
const openReleasePage = () => {
  chrome.tabs.create({
    url: 'https://github.com/hei-f/schema-editor/releases/',
    active: true
  })
}

/**
 * 设置页面组件（重构版）
 * 原491行的巨型组件已通过拆分hooks和配置进行优化
 */
export const OptionsApp: React.FC = () => {
  const [form] = Form.useForm()
  const [attributeName, setAttributeName] = useState(DEFAULT_VALUES.attributeName)
  const [getFunctionName, setGetFunctionName] = useState(DEFAULT_VALUES.getFunctionName)
  const [updateFunctionName, setUpdateFunctionName] = useState(DEFAULT_VALUES.updateFunctionName)
  
  const timeoutMapRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

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
      const toolbarButtons = await storage.getToolbarButtons()
      const drawerWidth = await storage.getDrawerWidth()
      const highlightColor = await storage.getHighlightColor()
      const maxFavoritesCount = await storage.getMaxFavoritesCount()
      const autoSaveDraft = await storage.getAutoSaveDraft()
      const previewConfig = await storage.getPreviewConfig()
      
      setAttributeName(name)
      setGetFunctionName(getFn)
      setUpdateFunctionName(updateFn)
      form.setFieldsValue({ 
        [FORM_FIELD_NAMES.ATTRIBUTE_NAME]: name,
        [FORM_FIELD_NAMES.DRAWER_WIDTH]: drawerWidth,
        [FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN]: searchConfig.searchDepthDown,
        [FORM_FIELD_NAMES.SEARCH_DEPTH_UP]: searchConfig.searchDepthUp,
        [FORM_FIELD_NAMES.THROTTLE_INTERVAL]: searchConfig.throttleInterval,
        [FORM_FIELD_NAMES.GET_FUNCTION_NAME]: getFn,
        [FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME]: updateFn,
        [FORM_FIELD_NAMES.AUTO_PARSE_STRING]: autoParse,
        [FORM_FIELD_NAMES.ENABLE_DEBUG_LOG]: debugLog,
        [FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE]: toolbarButtons.astRawStringToggle,
        [FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE]: toolbarButtons.deserialize,
        [FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE]: toolbarButtons.serialize,
        [FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT]: toolbarButtons.format,
        [FORM_FIELD_NAMES.TOOLBAR_BUTTON_PREVIEW]: toolbarButtons.preview,
        [FORM_FIELD_NAMES.HIGHLIGHT_COLOR]: highlightColor,
        [FORM_FIELD_NAMES.MAX_FAVORITES_COUNT]: maxFavoritesCount,
        [FORM_FIELD_NAMES.AUTO_SAVE_DRAFT]: autoSaveDraft,
        [FORM_FIELD_NAMES.PREVIEW_WIDTH]: previewConfig.previewWidth,
        [FORM_FIELD_NAMES.PREVIEW_UPDATE_DELAY]: previewConfig.updateDelay,
        [FORM_FIELD_NAMES.PREVIEW_REMEMBER_STATE]: previewConfig.rememberState,
        [FORM_FIELD_NAMES.PREVIEW_AUTO_UPDATE]: previewConfig.autoUpdate
      })
    } catch (error) {
      message.error('加载配置失败')
    }
  }

  const saveField = React.useCallback(async (fieldName: string, allValues: any) => {
    try {
      for (const [groupName, group] of Object.entries(FIELD_GROUPS)) {
        if (group.fields.has(fieldName)) {
          await group.save(allValues)
          
          if (groupName === 'functionNames') {
            setGetFunctionName(allValues[FORM_FIELD_NAMES.GET_FUNCTION_NAME])
            setUpdateFunctionName(allValues[FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME])
          }
          
          message.success('已保存', 1.5)
          return
        }
      }
      
      const storageMethod = FIELD_STORAGE_MAP[fieldName]
      if (storageMethod && (storage as any)[storageMethod]) {
        await (storage as any)[storageMethod](allValues[fieldName])
        
        if (fieldName === FORM_FIELD_NAMES.ATTRIBUTE_NAME) {
          setAttributeName(allValues[fieldName])
        }
        
        message.success('已保存', 1.5)
      }
    } catch (error) {
      message.error('保存失败')
    }
  }, [])

  const debouncedSave = React.useCallback(
    (fieldName: string, allValues: any) => {
      const existingTimeout = timeoutMapRef.current.get(fieldName)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      const newTimeout = setTimeout(async () => {
        try {
          await form.validateFields([fieldName])
          await saveField(fieldName, allValues)
        } catch (error) {
          // 验证失败，不保存
        }
        timeoutMapRef.current.delete(fieldName)
      }, 500)
      
      timeoutMapRef.current.set(fieldName, newTimeout)
    },
    [saveField, form]
  )

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const fieldName = Object.keys(changedValues)[0]
    
    if (DEBOUNCE_FIELDS.has(fieldName)) {
      debouncedSave(fieldName, allValues)
    } else {
      saveField(fieldName, allValues)
    }
  }

  return (
    <Container>
      <HeaderSection>
        <HeaderContent>
          <PageTitle level={2}>⚙️ Schema Editor 设置</PageTitle>
          <PageDescription type="secondary">
            配置插件的行为参数
          </PageDescription>
        </HeaderContent>
        <HeaderActions>
          <VersionTag>v1.2.0</VersionTag>
          <Button onClick={openReleasePage}>
            检查更新
          </Button>
        </HeaderActions>
      </HeaderSection>

      <StyledCard title="参数属性名配置">
        <AutoSaveHint>
          <CheckCircleOutlined />
          <span>所有配置项通过验证后将自动保存</span>
        </AutoSaveHint>
        
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={{ 
            [FORM_FIELD_NAMES.ATTRIBUTE_NAME]: DEFAULT_VALUES.attributeName,
            [FORM_FIELD_NAMES.DRAWER_WIDTH]: DEFAULT_VALUES.drawerWidth,
            [FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN]: DEFAULT_VALUES.searchConfig.searchDepthDown,
            [FORM_FIELD_NAMES.SEARCH_DEPTH_UP]: DEFAULT_VALUES.searchConfig.searchDepthUp,
            [FORM_FIELD_NAMES.THROTTLE_INTERVAL]: DEFAULT_VALUES.searchConfig.throttleInterval,
            [FORM_FIELD_NAMES.GET_FUNCTION_NAME]: DEFAULT_VALUES.getFunctionName,
            [FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME]: DEFAULT_VALUES.updateFunctionName,
            [FORM_FIELD_NAMES.AUTO_PARSE_STRING]: DEFAULT_VALUES.autoParseString,
            [FORM_FIELD_NAMES.ENABLE_DEBUG_LOG]: DEFAULT_VALUES.enableDebugLog,
            [FORM_FIELD_NAMES.HIGHLIGHT_COLOR]: DEFAULT_VALUES.highlightColor,
            [FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE]: DEFAULT_VALUES.toolbarButtons.astRawStringToggle,
            [FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE]: DEFAULT_VALUES.toolbarButtons.deserialize,
            [FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE]: DEFAULT_VALUES.toolbarButtons.serialize,
            [FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT]: DEFAULT_VALUES.toolbarButtons.format,
            [FORM_FIELD_NAMES.TOOLBAR_BUTTON_PREVIEW]: DEFAULT_VALUES.toolbarButtons.preview,
            [FORM_FIELD_NAMES.MAX_FAVORITES_COUNT]: DEFAULT_VALUES.maxFavoritesCount,
            [FORM_FIELD_NAMES.AUTO_SAVE_DRAFT]: DEFAULT_VALUES.autoSaveDraft,
            [FORM_FIELD_NAMES.PREVIEW_WIDTH]: DEFAULT_VALUES.previewConfig.previewWidth,
            [FORM_FIELD_NAMES.PREVIEW_UPDATE_DELAY]: DEFAULT_VALUES.previewConfig.updateDelay,
            [FORM_FIELD_NAMES.PREVIEW_REMEMBER_STATE]: DEFAULT_VALUES.previewConfig.rememberState,
            [FORM_FIELD_NAMES.PREVIEW_AUTO_UPDATE]: DEFAULT_VALUES.previewConfig.autoUpdate
          }}
        >
          <Form.Item
            label="属性名称"
            name={FORM_FIELD_NAMES.ATTRIBUTE_NAME}
            rules={[
              { required: true, message: '请输入属性名称' },
              { pattern: /^[a-z][a-z0-9-]*$/, message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头' }
            ]}
            extra={`此属性名将用于从页面元素中提取参数，默认值为 ${DEFAULT_VALUES.attributeName}`}
          >
            <Input placeholder={`例如: ${DEFAULT_VALUES.attributeName}`} />
          </Form.Item>

          <SectionTitle level={5}>API函数配置</SectionTitle>
          <Form.Item
            label="获取Schema函数名"
            name={FORM_FIELD_NAMES.GET_FUNCTION_NAME}
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
            name={FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME}
            rules={[
              { required: true, message: '请输入函数名' },
              { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
            ]}
            extra="页面需要提供的更新Schema数据的全局函数名"
          >
            <Input placeholder={`例如: ${DEFAULT_VALUES.updateFunctionName}`} />
          </Form.Item>

          <SectionTitle level={5}>搜索配置</SectionTitle>
          <Form.Item
            label="向下搜索深度"
            name={FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN}
            extra="查找子元素的最大层数，设置为 0 则不向下搜索"
          >
            <FullWidthInputNumber min={0} />
          </Form.Item>

          <Form.Item
            label="向上搜索深度"
            name={FORM_FIELD_NAMES.SEARCH_DEPTH_UP}
            extra="查找父元素的最大层数，设置为 0 则不向上搜索"
          >
            <FullWidthInputNumber min={0} />
          </Form.Item>

          <Form.Item
            label="节流间隔 (毫秒)"
            name={FORM_FIELD_NAMES.THROTTLE_INTERVAL}
            extra="控制鼠标移动检测频率，建议范围 8-200ms"
          >
            <FullWidthInputNumber min={8} />
          </Form.Item>

          <StyledCollapse>
            <Panel header="高级" key="advanced">
              <Form.Item
                label={
                  <Space>
                    字符串自动解析
                    <Tooltip title="开启后，当获取的Schema数据为字符串时，插件会自动将其解析为Markdown Elements结构">
                      <HelpIcon />
                    </Tooltip>
                  </Space>
                }
                name={FORM_FIELD_NAMES.AUTO_PARSE_STRING}
                valuePropName="checked"
                extra="自动将字符串类型的Schema数据解析为Markdown Elements结构"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="启用调试日志"
                name={FORM_FIELD_NAMES.ENABLE_DEBUG_LOG}
                valuePropName="checked"
                extra="在浏览器控制台显示插件的调试日志信息"
              >
                <Switch />
              </Form.Item>
            </Panel>

            <Panel header="外观配置" key="appearance">
              <Form.Item
                label="抽屉宽度"
                name={FORM_FIELD_NAMES.DRAWER_WIDTH}
                rules={[
                  { required: true, message: '请输入抽屉宽度' },
                  { pattern: /^\d+(%|px)$/, message: '宽度格式必须为数字+px或%' }
                ]}
                extra="设置编辑器抽屉的宽度"
              >
                <Input placeholder={`例如: ${DEFAULT_VALUES.drawerWidth}`} />
              </Form.Item>

              <Form.Item
                label="高亮框颜色"
                name={FORM_FIELD_NAMES.HIGHLIGHT_COLOR}
                extra="设置鼠标悬停时元素高亮框的颜色"
              >
                <ColorPickerField />
              </Form.Item>
            </Panel>

            <Panel 
              header={
                <span>
                  功能项配置 
                  <Tooltip title="开启/关闭对应的功能">
                    <QuestionCircleOutlined style={{ marginLeft: '8px', color: '#999' }} />
                  </Tooltip>
                </span>
              } 
              key="toolbarButtons"
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>AST/RawString切换:</span>
                  <Form.Item
                    name={FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>反序列化:</span>
                  <Form.Item
                    name={FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>序列化:</span>
                  <Form.Item
                    name={FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>格式化:</span>
                  <Form.Item
                    name={FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>预览:</span>
                  <Form.Item
                    name={FORM_FIELD_NAMES.TOOLBAR_BUTTON_PREVIEW}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </Panel>

            <Panel header="草稿与收藏配置" key="draft-favorites">
              <SectionTitle level={5} $noMarginTop>草稿配置</SectionTitle>
              
              <Form.Item
                label="草稿自动保存"
                name={FORM_FIELD_NAMES.AUTO_SAVE_DRAFT}
                valuePropName="checked"
                extra="开启后，编辑器内容变化时会自动保存草稿"
              >
                <Switch />
              </Form.Item>

              <SectionSubTitle level={5}>收藏配置</SectionSubTitle>
              
              <Form.Item
                label="最大收藏数量"
                name={FORM_FIELD_NAMES.MAX_FAVORITES_COUNT}
                rules={[
                  { required: true, message: '请输入最大收藏数量' },
                  { type: 'number', min: 10, max: 200, message: '最大收藏数量必须在10-200之间' }
                ]}
                extra={`收藏列表的最大容量，默认值为 ${DEFAULT_VALUES.maxFavoritesCount}`}
              >
                <FullWidthInputNumber min={10} max={200} step={10} placeholder="50" />
              </Form.Item>
            </Panel>

            <Panel header="实时预览配置" key="preview">
              <Form.Item
                label="自动更新预览"
                name={FORM_FIELD_NAMES.PREVIEW_AUTO_UPDATE}
                valuePropName="checked"
                extra="编辑器内容变化时自动更新预览（使用下面设置的延迟）"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                label="更新延迟（毫秒）"
                name={FORM_FIELD_NAMES.PREVIEW_UPDATE_DELAY}
                extra="编辑后多久更新预览，避免频繁渲染"
              >
                <InputNumber 
                  min={100} 
                  max={2000} 
                  step={100}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item
                label="预览区域宽度"
                name={FORM_FIELD_NAMES.PREVIEW_WIDTH}
                extra="预览区域占抽屉的百分比（10-60%）"
              >
                <Slider 
                  min={10} 
                  max={60} 
                  marks={{ 
                    10: '10%', 
                    30: '30%', 
                    40: '40%', 
                    60: '60%' 
                  }}
                />
              </Form.Item>
                            <Form.Item
                label="记住预览状态"
                name={FORM_FIELD_NAMES.PREVIEW_REMEMBER_STATE}
                valuePropName="checked"
                extra="下次打开抽屉时自动恢复预览状态"
              >
                <Switch />
              </Form.Item>
            </Panel>
          </StyledCollapse>
        </Form>

        <ExampleSection>
          <ExampleLabel strong>当前配置示例：</ExampleLabel>
          <CodeBlock>
            <span className="comment">&lt;!-- HTML元素属性 --&gt;</span>{'\n'}
            <span className="tag">&lt;div</span> <span className="attr-name">data-{attributeName}</span>=<span className="attr-value">"param1,param2"</span><span className="tag">&gt;</span>{'\n'}
            {'  '}点击此元素{'\n'}
            <span className="tag">&lt;/div&gt;</span>{'\n\n'}
            <span className="comment">&lt;!-- 页面需要提供的全局函数 --&gt;</span>{'\n'}
            <span className="tag">&lt;script&gt;</span>{'\n'}
            {'  '}<span className="keyword">window</span>.<span className="function">{getFunctionName}</span> = <span className="keyword">function</span>(params) {'{'} ... {'}'};{'\n'}
            {'  '}<span className="keyword">window</span>.<span className="function">{updateFunctionName}</span> = <span className="keyword">function</span>(schema, params) {'{'} ... {'}'};{'\n'}
            <span className="tag">&lt;/script&gt;</span>
          </CodeBlock>
        </ExampleSection>
      </StyledCard>

      <StyledCard title="使用说明">
        <Typography.Paragraph>
          <ol>
            <li>在页面HTML元素上添加 <Typography.Text code>data-{attributeName}</Typography.Text> 属性</li>
            <li>页面需要实现获取和更新Schema数据的全局函数</li>
            <li>激活插件后，按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键悬停查看参数</li>
            <li>按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键并点击元素打开编辑器</li>
          </ol>
        </Typography.Paragraph>
      </StyledCard>

      <StyledCard title="Schema类型支持">
        <Typography.Paragraph>
          Schema编辑器支持字符串、数字、对象、数组、布尔值等数据类型
        </Typography.Paragraph>
        <SchemaNote type="secondary">
          注意：编辑器使用JSON格式，字符串值需要用引号包裹
        </SchemaNote>
      </StyledCard>
    </Container>
  )
}

