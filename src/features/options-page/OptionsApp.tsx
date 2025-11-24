import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { storage } from '@/shared/utils/browser/storage'
import { getChangedFieldPath, getValueByPath, pathToString } from '@/shared/utils/form-path'
import { CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Collapse, Form, Input, InputNumber, message, Slider, Space, Switch, Tooltip, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { ColorPickerField } from './components/ColorPickerField'
import { FIELD_PATH_STORAGE_MAP, findFieldGroup, isDebounceField } from './config/field-config'
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
      const attributeName = await storage.getAttributeName()
      const searchConfig = await storage.getSearchConfig()
      const getFunctionName = await storage.getGetFunctionName()
      const updateFunctionName = await storage.getUpdateFunctionName()
      const autoParseString = await storage.getAutoParseString()
      const enableDebugLog = await storage.getEnableDebugLog()
      const toolbarButtons = await storage.getToolbarButtons()
      const drawerWidth = await storage.getDrawerWidth()
      const highlightColor = await storage.getHighlightColor()
      const maxFavoritesCount = await storage.getMaxFavoritesCount()
      const autoSaveDraft = await storage.getAutoSaveDraft()
      const previewConfig = await storage.getPreviewConfig()
      const maxHistoryCount = await storage.getMaxHistoryCount()
      const highlightAllConfig = await storage.getHighlightAllConfig()
      const enableAstTypeHints = await storage.getEnableAstTypeHints()
      
      setAttributeName(attributeName)
      setGetFunctionName(getFunctionName)
      setUpdateFunctionName(updateFunctionName)
      
      form.setFieldsValue({
        attributeName,
        drawerWidth,
        searchConfig,
        getFunctionName,
        updateFunctionName,
        autoParseString,
        enableDebugLog,
        toolbarButtons,
        highlightColor,
        maxFavoritesCount,
        autoSaveDraft,
        previewConfig,
        maxHistoryCount,
        highlightAllConfig,
        enableAstTypeHints
      })
    } catch (error) {
      message.error('加载配置失败')
    }
  }

  const saveField = React.useCallback(async (fieldPath: string[], allValues: any) => {
    try {
      // 查找字段所属的分组
      const fieldGroup = findFieldGroup(fieldPath)
      
      if (fieldGroup) {
        // 如果属于分组，使用分组的保存方法
        await fieldGroup.save(allValues)
        
        // 更新特定的 state
        if (fieldPath[0] === 'getFunctionName' || fieldPath[0] === 'updateFunctionName') {
          setGetFunctionName(allValues.getFunctionName)
          setUpdateFunctionName(allValues.updateFunctionName)
        }
        
        message.success('已保存', 1.5)
        return
      }
      
      // 独立字段的保存逻辑
      const pathKey = pathToString(fieldPath)
      const storageMethod = FIELD_PATH_STORAGE_MAP[pathKey]
      
      if (storageMethod && (storage as any)[storageMethod]) {
        const fieldValue = getValueByPath(allValues, fieldPath)
        await (storage as any)[storageMethod](fieldValue)
        
        // 更新特定的 state
        if (pathKey === 'attributeName') {
          setAttributeName(fieldValue)
        }
        
        message.success('已保存', 1.5)
      }
    } catch (error) {
      message.error('保存失败')
    }
  }, [])

  const debouncedSave = React.useCallback(
    (fieldPath: string[], allValues: any) => {
      const pathKey = pathToString(fieldPath)
      const existingTimeout = timeoutMapRef.current.get(pathKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      const newTimeout = setTimeout(async () => {
        try {
          await form.validateFields([fieldPath])
          await saveField(fieldPath, allValues)
        } catch (error) {
          // 验证失败，不保存
        }
        timeoutMapRef.current.delete(pathKey)
      }, 500)
      
      timeoutMapRef.current.set(pathKey, newTimeout)
    },
    [saveField, form]
  )

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const fieldPath = getChangedFieldPath(changedValues)
    
    if (isDebounceField(fieldPath)) {
      debouncedSave(fieldPath, allValues)
    } else {
      saveField(fieldPath, allValues)
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
          <VersionTag>v1.5.1</VersionTag>
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
          initialValues={DEFAULT_VALUES}
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

          <SectionTitle level={5}>API函数配置</SectionTitle>
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

          <SectionTitle level={5}>搜索配置</SectionTitle>
          <Form.Item
            label="向下搜索深度"
            name={FORM_PATHS.searchConfig.searchDepthDown}
            extra="查找子元素的最大层数，设置为 0 则不向下搜索"
          >
            <FullWidthInputNumber min={0} />
          </Form.Item>

          <Form.Item
            label="向上搜索深度"
            name={FORM_PATHS.searchConfig.searchDepthUp}
            extra="查找父元素的最大层数，设置为 0 则不向上搜索"
          >
            <FullWidthInputNumber min={0} />
          </Form.Item>

          <Form.Item
            label="节流间隔 (毫秒)"
            name={FORM_PATHS.searchConfig.throttleInterval}
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
                name={FORM_PATHS.autoParseString}
                valuePropName="checked"
                extra="自动将字符串类型的Schema数据解析为Markdown Elements结构"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="启用调试日志"
                name={FORM_PATHS.enableDebugLog}
                valuePropName="checked"
                extra="在浏览器控制台显示插件的调试日志信息"
              >
                <Switch />
              </Form.Item>
            </Panel>

            <Panel header="外观配置" key="appearance">
              <Form.Item
                label="抽屉宽度"
                name={FORM_PATHS.drawerWidth}
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
                name={FORM_PATHS.highlightColor}
                extra="设置鼠标悬停时元素高亮框的颜色"
              >
                <ColorPickerField />
              </Form.Item>

              <Typography.Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
                快捷键高亮所有元素
              </Typography.Title>

              <Form.Item
                label="启用功能"
                name={FORM_PATHS.highlightAllConfig.enabled}
                valuePropName="checked"
                extra="按住 Alt 键并按下配置的快捷键，高亮页面上所有合法元素"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="快捷键"
                name={FORM_PATHS.highlightAllConfig.keyBinding}
                rules={[
                  { required: true, message: '请输入快捷键' },
                  { pattern: /^[a-zA-Z0-9]$/, message: '请输入单个字母或数字' }
                ]}
                extra="输入单个字母或数字（0-9、A-Z），使用时按 Alt + [字符]"
                normalize={(value) => value?.toLowerCase()}
              >
                <Input
                  placeholder="a"
                  maxLength={1}
                  style={{ width: 80 }}
                  prefix="Alt +"
                />
              </Form.Item>

              <Form.Item
                label="最大高亮数量"
                name={FORM_PATHS.highlightAllConfig.maxHighlightCount}
                rules={[
                  { required: true, message: '请输入最大高亮数量' },
                  { type: 'number', min: 100, max: 1000, message: '请输入 100-1000 之间的数字' }
                ]}
                extra="避免页面卡顿，建议 100-1000 之间"
              >
                <InputNumber
                  min={100}
                  max={1000}
                  step={50}
                  style={{ width: 150 }}
                  addonAfter="个"
                />
              </Form.Item>

              <Alert
                message="使用说明"
                description={
                  <div>
                    <p>1. 按住 Alt 键并按下配置的快捷键（默认 A），高亮所有带有 data-{attributeName} 属性的元素</p>
                    <p>2. 松开 Alt 键，自动清除所有高亮</p>
                    <p>3. 高亮时会显示每个元素的参数值标签</p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
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
                    name={FORM_PATHS.toolbarButtons.astRawStringToggle}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>反序列化:</span>
                  <Form.Item
                    name={FORM_PATHS.toolbarButtons.deserialize}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>序列化:</span>
                  <Form.Item
                    name={FORM_PATHS.toolbarButtons.serialize}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>格式化:</span>
                  <Form.Item
                    name={FORM_PATHS.toolbarButtons.format}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>预览:</span>
                  <Form.Item
                    name={FORM_PATHS.toolbarButtons.preview}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>AST类型提示:</span>
                  <Form.Item
                    name={FORM_PATHS.enableAstTypeHints}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                  <Tooltip title="编辑 AST (Elements[]) 类型数据时，提供字段名和类型的智能补全">
                    <QuestionCircleOutlined style={{ color: '#999', cursor: 'pointer' }} />
                  </Tooltip>
                </div>
              </div>
            </Panel>

            <Panel header="草稿与收藏配置" key="draft-favorites">
              <SectionTitle level={5} $noMarginTop>草稿配置</SectionTitle>
              
              <Form.Item
                label="草稿自动保存"
                name={FORM_PATHS.autoSaveDraft}
                valuePropName="checked"
                extra="开启后，编辑器内容变化时会自动保存草稿"
              >
                <Switch />
              </Form.Item>

              <SectionSubTitle level={5}>收藏配置</SectionSubTitle>
              
              <Form.Item
                label="最大收藏数量"
                name={FORM_PATHS.maxFavoritesCount}
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
                name={FORM_PATHS.previewConfig.autoUpdate}
                valuePropName="checked"
                extra="编辑器内容变化时自动更新预览（使用下面设置的延迟）"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                label="更新延迟（毫秒）"
                name={FORM_PATHS.previewConfig.updateDelay}
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
                name={FORM_PATHS.previewConfig.previewWidth}
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
                name={FORM_PATHS.previewConfig.rememberState}
                valuePropName="checked"
                extra="下次打开抽屉时自动恢复预览状态"
              >
                <Switch />
              </Form.Item>
            </Panel>

            {/* 编辑历史配置 */}
            <Panel header="📜 编辑历史配置" key="history">
              <Form.Item
                label="历史记录上限"
                name={FORM_PATHS.maxHistoryCount}
                extra="编辑历史的最大保存数量（不包含保存/草稿/收藏等特殊版本）"
                rules={[
                  { required: true, message: '请输入历史记录上限' },
                  { type: 'number', min: 10, max: 200, message: '请输入 10-200 之间的数字' }
                ]}
              >
                <InputNumber
                  min={10}
                  max={200}
                  step={10}
                  style={{ width: '100%' }}
                  addonAfter="条"
                />
              </Form.Item>
              
              <Alert
                message="提示"
                description="历史记录保存在浏览器的 sessionStorage 中，关闭标签页后会自动清除。特殊版本（如保存、加载草稿、应用收藏）不计入上限。"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
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

