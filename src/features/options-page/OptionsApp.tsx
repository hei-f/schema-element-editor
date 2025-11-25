import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { storage } from '@/shared/utils/browser/storage'
import { getChangedFieldPath, getValueByPath, pathToString } from '@/shared/utils/form-path'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Form, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { FIELD_PATH_STORAGE_MAP, findFieldGroup, isDebounceField } from './config/field-config'
import { BasicIntegrationSection } from './sections/BasicIntegrationSection'
import { DataManagementSection } from './sections/DataManagementSection'
import { DebugSection } from './sections/DebugSection'
import { EditorConfigSection } from './sections/EditorConfigSection'
import { ElementDetectionSection } from './sections/ElementDetectionSection'
import { FeatureToggleSection } from './sections/FeatureToggleSection'
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
      const exportConfig = await storage.getExportConfig()
      const editorTheme = await storage.getEditorTheme()
      
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
        enableAstTypeHints,
        exportConfig,
        editorTheme
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
          <VersionTag>v1.7.0</VersionTag>
          <Button onClick={openReleasePage}>
            检查更新
          </Button>
        </HeaderActions>
      </HeaderSection>

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
        {/* 卡片1: 基础集成配置 */}
        <BasicIntegrationSection 
          attributeName={attributeName}
          getFunctionName={getFunctionName}
          updateFunctionName={updateFunctionName}
        />

        {/* 卡片2: 元素检测与高亮 */}
        <ElementDetectionSection attributeName={attributeName} />

        {/* 卡片3: 编辑器配置 */}
        <EditorConfigSection />

        {/* 卡片4: 功能开关 */}
        <FeatureToggleSection />

        {/* 卡片5: 实时预览配置 */}
        <PreviewConfigSection />

        {/* 卡片6: 数据管理配置 */}
        <DataManagementSection />

        {/* 卡片7: 开发调试 */}
        <DebugSection />
        </Form>

      {/* 卡片8: 使用指南 */}
      <UsageGuideSection attributeName={attributeName} />
    </Container>
  )
}

