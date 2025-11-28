import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { ApiConfig, CommunicationMode } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { getChangedFieldPath, getValueByPath, pathToString } from '@/shared/utils/form-path'
import { CheckCircleOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Form, message, Popconfirm } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { FIELD_PATH_STORAGE_MAP, findFieldGroup, SECTION_DEFAULT_KEYS, SECTION_KEYS, type SectionKey } from './config/field-config'
import { DataManagementSection } from './sections/DataManagementSection'
import { DebugSection } from './sections/DebugSection'
import { EditorConfigSection } from './sections/EditorConfigSection'
import { ElementDetectionSection } from './sections/ElementDetectionSection'
import { FeatureToggleSection } from './sections/FeatureToggleSection'
import { IntegrationConfigSection } from './sections/IntegrationConfigSection'
import { PreviewConfigSection } from './sections/PreviewConfigSection'
import { UsageGuideSection } from './sections/UsageGuideSection'
import {
  AutoSaveHint,
  Container,
  HeaderActions,
  HeaderContent,
  HeaderSection,
  PageDescription,
  PageTitle,
  VersionTag
} from './styles/layout.styles'

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
 * 设置页面组件
 */
export const OptionsApp: React.FC = () => {
  const [form] = Form.useForm()
  const [attributeName, setAttributeName] = useState(DEFAULT_VALUES.attributeName)
  const [getFunctionName, setGetFunctionName] = useState(DEFAULT_VALUES.getFunctionName)
  const [updateFunctionName, setUpdateFunctionName] = useState(DEFAULT_VALUES.updateFunctionName)
  const [previewFunctionName, setPreviewFunctionName] = useState(DEFAULT_VALUES.previewFunctionName)
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>(DEFAULT_VALUES.apiConfig.communicationMode)
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  
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
      const recordingModeConfig = await storage.getRecordingModeConfig()
      const enableAstTypeHints = await storage.getEnableAstTypeHints()
      const exportConfig = await storage.getExportConfig()
      const editorTheme = await storage.getEditorTheme()
      const previewFunctionName = await storage.getPreviewFunctionName()
      const apiConfig = await storage.getApiConfig()
      
      setAttributeName(attributeName)
      setGetFunctionName(getFunctionName)
      setUpdateFunctionName(updateFunctionName)
      setPreviewFunctionName(previewFunctionName)
      setCommunicationMode(apiConfig.communicationMode)
      setApiConfig(apiConfig)
      
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
        recordingModeConfig,
        enableAstTypeHints,
        exportConfig,
        editorTheme,
        previewFunctionName,
        apiConfig
      })
    } catch (error) {
      message.error('加载配置失败')
    }
  }

  const saveField = useCallback(async (fieldPath: string[], allValues: any) => {
    try {
      const fieldGroup = findFieldGroup(fieldPath)
      
      if (fieldGroup) {
        await fieldGroup.save(allValues)
        
        if (fieldPath[0] === 'getFunctionName' || fieldPath[0] === 'updateFunctionName') {
          setGetFunctionName(allValues.getFunctionName)
          setUpdateFunctionName(allValues.updateFunctionName)
        }
        
        if (fieldPath[0] === 'previewFunctionName') {
          setPreviewFunctionName(allValues.previewFunctionName)
        }
        
        if (fieldPath[0] === 'apiConfig') {
          setCommunicationMode(allValues.apiConfig.communicationMode)
          setApiConfig(allValues.apiConfig)
        }
        
        message.success('已保存', 1.5)
        return
      }
      
      const pathKey = pathToString(fieldPath)
      const storageMethod = FIELD_PATH_STORAGE_MAP[pathKey]
      
      if (storageMethod && (storage as any)[storageMethod]) {
        const fieldValue = getValueByPath(allValues, fieldPath)
        await (storage as any)[storageMethod](fieldValue)
        
        if (pathKey === 'attributeName') {
          setAttributeName(fieldValue)
        }
        
        message.success('已保存', 1.5)
      }
    } catch (error) {
      message.error('保存失败')
    }
  }, [])

  const debouncedSave = useCallback(
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
          console.debug('表单验证失败，不保存:', error)
        }
        timeoutMapRef.current.delete(pathKey)
      }, 500)
      
      timeoutMapRef.current.set(pathKey, newTimeout)
    },
    [saveField, form]
  )

  const isDebounceField = useCallback((fieldPath: string[]) => {
    const debounceFields = [
      'attributeName', 'drawerWidth', 'getFunctionName', 'updateFunctionName', 
      'previewFunctionName', 'maxFavoritesCount', 'highlightColor', 'maxHistoryCount'
    ]
    // apiConfig 下需要防抖的字段
    const apiConfigDebounceFields = ['requestTimeout', 'sourceConfig', 'messageTypes']
    
    return debounceFields.includes(fieldPath[0]) || 
           (fieldPath[0] === 'searchConfig' && ['searchDepthUp', 'throttleInterval'].includes(fieldPath[1])) ||
           (fieldPath[0] === 'highlightAllConfig' && ['keyBinding', 'maxHighlightCount'].includes(fieldPath[1])) ||
           (fieldPath[0] === 'recordingModeConfig' && ['keyBinding', 'pollingInterval', 'highlightColor'].includes(fieldPath[1])) ||
           (fieldPath[0] === 'apiConfig' && apiConfigDebounceFields.includes(fieldPath[1]))
  }, [])

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const fieldPath = getChangedFieldPath(changedValues)
    
    if (isDebounceField(fieldPath)) {
      debouncedSave(fieldPath, allValues)
    } else {
      saveField(fieldPath, allValues)
    }
  }

  /**
   * 恢复指定卡片的默认配置
   */
  const resetSectionToDefault = useCallback(async (sectionKey: SectionKey) => {
    const keys = SECTION_DEFAULT_KEYS[sectionKey]
    const defaultValues: Record<string, any> = {}
    
    for (const key of keys) {
      defaultValues[key] = (DEFAULT_VALUES as any)[key]
    }
    
    form.setFieldsValue(defaultValues)
    
    // 保存到 storage
    for (const key of keys) {
      const value = (DEFAULT_VALUES as any)[key]
      const storageMethod = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`
      if ((storage as any)[storageMethod]) {
        await (storage as any)[storageMethod](value)
      }
    }
    
    // 更新 state
    if (sectionKey === SECTION_KEYS.INTEGRATION_CONFIG) {
      setAttributeName(DEFAULT_VALUES.attributeName)
      setGetFunctionName(DEFAULT_VALUES.getFunctionName)
      setUpdateFunctionName(DEFAULT_VALUES.updateFunctionName)
      setPreviewFunctionName(DEFAULT_VALUES.previewFunctionName)
      setCommunicationMode(DEFAULT_VALUES.apiConfig.communicationMode)
      setApiConfig(DEFAULT_VALUES.apiConfig)
    }
    
    message.success('已恢复默认配置')
  }, [form])

  /**
   * 恢复全部默认配置
   */
  const resetAllToDefault = useCallback(async () => {
    form.setFieldsValue(DEFAULT_VALUES)
    
    // 保存所有默认值到 storage
    await storage.setAttributeName(DEFAULT_VALUES.attributeName)
    await storage.setDrawerWidth(DEFAULT_VALUES.drawerWidth)
    await storage.setSearchConfig(DEFAULT_VALUES.searchConfig)
    await storage.setFunctionNames(DEFAULT_VALUES.getFunctionName, DEFAULT_VALUES.updateFunctionName, DEFAULT_VALUES.previewFunctionName)
    await storage.setAutoParseString(DEFAULT_VALUES.autoParseString)
    await storage.setEnableDebugLog(DEFAULT_VALUES.enableDebugLog)
    await storage.setToolbarButtons(DEFAULT_VALUES.toolbarButtons)
    await storage.setHighlightColor(DEFAULT_VALUES.highlightColor)
    await storage.setMaxFavoritesCount(DEFAULT_VALUES.maxFavoritesCount)
    await storage.setAutoSaveDraft(DEFAULT_VALUES.autoSaveDraft)
    await storage.setPreviewConfig(DEFAULT_VALUES.previewConfig)
    await storage.setMaxHistoryCount(DEFAULT_VALUES.maxHistoryCount)
    await storage.setHighlightAllConfig(DEFAULT_VALUES.highlightAllConfig)
    await storage.setRecordingModeConfig(DEFAULT_VALUES.recordingModeConfig)
    await storage.setEnableAstTypeHints(DEFAULT_VALUES.enableAstTypeHints)
    await storage.setExportConfig(DEFAULT_VALUES.exportConfig)
    await storage.setEditorTheme(DEFAULT_VALUES.editorTheme)
    await storage.setApiConfig(DEFAULT_VALUES.apiConfig)
    
    // 更新 state
    setAttributeName(DEFAULT_VALUES.attributeName)
    setGetFunctionName(DEFAULT_VALUES.getFunctionName)
    setUpdateFunctionName(DEFAULT_VALUES.updateFunctionName)
    setPreviewFunctionName(DEFAULT_VALUES.previewFunctionName)
    setCommunicationMode(DEFAULT_VALUES.apiConfig.communicationMode)
    setApiConfig(DEFAULT_VALUES.apiConfig)
    
    message.success('已恢复全部默认配置')
  }, [form])

  return (
    <Container>
      <HeaderSection justify="space-between" align="center" gap={16}>
        <HeaderContent>
          <PageTitle level={2}>⚙️ Schema Editor 设置</PageTitle>
          <PageDescription type="secondary">
            配置插件的行为参数
          </PageDescription>
        </HeaderContent>
        <HeaderActions align="center" gap={12}>
          <VersionTag>v1.12.1</VersionTag>
          <Button onClick={openReleasePage}>
            检查更新
          </Button>
        </HeaderActions>
      </HeaderSection>

      <AutoSaveHint align="center" gap={8}>
        <CheckCircleOutlined />
        <span>所有配置项通过验证后将自动保存</span>
        <Popconfirm
          title="恢复默认配置"
          description="确定要将所有配置恢复为默认值吗？"
          onConfirm={resetAllToDefault}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" icon={<UndoOutlined />}>
            恢复全部默认
          </Button>
        </Popconfirm>
      </AutoSaveHint>
        
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={DEFAULT_VALUES}
      >
        {/* 卡片1: 集成配置 - 通信模式、属性名、API配置 */}
        <IntegrationConfigSection
          communicationMode={communicationMode}
          attributeName={attributeName}
          getFunctionName={getFunctionName}
          updateFunctionName={updateFunctionName}
          previewFunctionName={previewFunctionName}
          apiConfig={apiConfig}
          onResetDefault={() => resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)}
        />

        {/* 卡片2: 元素检测与高亮 - 搜索配置、高亮颜色、快捷键高亮 */}
        <ElementDetectionSection 
          attributeName={attributeName} 
          onResetDefault={() => resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)}
        />

        {/* 卡片3: 编辑器配置 - 抽屉宽度、字符串解析、AST提示、主题 */}
        <EditorConfigSection onResetDefault={() => resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)} />

        {/* 卡片4: 功能开关 - 工具栏按钮显示/隐藏 */}
        <FeatureToggleSection onResetDefault={() => resetSectionToDefault(SECTION_KEYS.FEATURE_TOGGLE)} />

        {/* 卡片5: 实时预览配置 - 自动更新、防抖延迟、预览宽度 */}
        <PreviewConfigSection onResetDefault={() => resetSectionToDefault(SECTION_KEYS.PREVIEW_CONFIG)} />

        {/* 卡片6: 数据管理配置 - 草稿、收藏、历史记录、导出 */}
        <DataManagementSection onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DATA_MANAGEMENT)} />

        {/* 卡片7: 开发调试 - 调试日志等开发者选项 */}
        <DebugSection onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DEBUG)} />
      </Form>

      <UsageGuideSection attributeName={attributeName} />
    </Container>
  )
}
