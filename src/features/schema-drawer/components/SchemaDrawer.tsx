import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import type { ElementAttributes } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import {
  DeleteOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined
} from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import { Button, Drawer, Space, Tooltip, message } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useContentDetection } from '../hooks/useContentDetection'
import { useDraftManagement } from '../hooks/useDraftManagement'
import { useFavoritesManagement } from '../hooks/useFavoritesManagement'
import { useLightNotifications } from '../hooks/useLightNotifications'
import { useSchemaSave } from '../hooks/useSchemaSave'
import { schemaTransformer } from '../services/schema-transformer'
import {
  DraftAutoSaveSuccess,
  DraftNotification,
  DrawerContentContainer,
  DrawerFooter,
  DrawerTitleActions,
  DrawerTitleContainer,
  DrawerTitleLeft
} from '../styles/drawer.styles'
import { EditorContainer } from '../styles/editor.styles'
import { LightSuccessNotification } from '../styles/notifications.styles'
import { DrawerToolbar } from './DrawerToolbar'
import { MonacoErrorBoundary } from './MonacoErrorBoundary'

interface SchemaDrawerProps {
  open: boolean
  schemaData: any
  attributes: ElementAttributes
  onClose: () => void
  onSave: (data: any) => Promise<void>
  width: number | string
  shadowRoot: ShadowRoot
}

/**
 * Schema编辑器抽屉组件（重构版）
 */
export const SchemaDrawer: React.FC<SchemaDrawerProps> = ({ 
  open, 
  schemaData, 
  attributes, 
  onClose, 
  onSave, 
  width,
  shadowRoot
}) => {
  const [editorValue, setEditorValue] = useState<string>('')
  const [isModified, setIsModified] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)
  const [toolbarButtons, setToolbarButtons] = useState({
    astRawStringToggle: true,
    deserialize: true,
    serialize: true,
    format: true
  })
  const [autoSaveDraft, setAutoSaveDraft] = useState(false)
  
  const paramsKey = attributes.params.join(',')
  const isFirstLoadRef = useRef(true)

  /** 内容类型检测 */
  const { 
    contentType, 
    canParse, 
    detectContentType, 
    debouncedDetectContent,
    updateContentType
  } = useContentDetection()

  /** 轻量提示 */
  const { lightNotifications, showLightNotification } = useLightNotifications()

  /** 保存逻辑 */
  const { isSaving, handleSave } = useSchemaSave({
    editorValue,
    wasStringData,
    paramsKey,
    onSaveSuccess: () => {
      setIsModified(false)
      message.success('保存成功')
      onClose()
    },
    onSave
  })

  /** 加载草稿内容的回调 */
  const handleLoadDraftContent = useCallback((content: string) => {
    setEditorValue(content)
    setIsModified(true)
    const result = detectContentType(content)
    updateContentType(result)
  }, [detectContentType, updateContentType])

  /** 草稿管理 */
  const {
    hasDraft,
    showDraftNotification,
    draftAutoSaveStatus,
    checkDraft,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    debouncedAutoSaveDraft
  } = useDraftManagement({
    paramsKey,
    editorValue,
    isModified,
    autoSaveDraft,
    isFirstLoad: isFirstLoadRef.current,
    onLoadDraft: handleLoadDraftContent,
    onSuccess: (msg) => message.success(msg, 1.5),
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg)
  })

  /** 应用收藏内容的回调 */
  const handleApplyFavoriteContent = useCallback((content: string) => {
    setEditorValue(content)
    setIsModified(true)
    const result = detectContentType(content)
    updateContentType(result)
  }, [detectContentType, updateContentType])

  /** 收藏管理 */
  const {
    favoritesList,
    favoritesModalVisible,
    addFavoriteModalVisible,
    favoriteNameInput,
    previewModalVisible,
    previewContent,
    previewTitle,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleDeleteFavorite,
    handlePreviewFavorite,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closePreviewModal
  } = useFavoritesManagement({
    editorValue,
    paramsKey,
    isModified,
    onApplyFavorite: handleApplyFavoriteContent,
    onShowLightNotification: showLightNotification,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg)
  })

  /**
   * Portal组件的容器获取函数
   */
  const getPortalContainer = () => shadowRoot as unknown as HTMLElement

  /**
   * 加载工具栏按钮配置和草稿配置
   */
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [toolbarConfig, autoSave] = await Promise.all([
          storage.getToolbarButtons(),
          storage.getAutoSaveDraft()
        ])
        setToolbarButtons(toolbarConfig)
        setAutoSaveDraft(autoSave)
      } catch (error) {
        logger.error('加载配置失败:', error)
      }
    }
    loadConfigs()
  }, [])

  /**
   * 监听抽屉打开状态，打开时检查草稿并重置编辑器
   */
  useEffect(() => {
    if (open) {
      isFirstLoadRef.current = true
      checkDraft()
    }
  }, [open, checkDraft])

  /**
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    const processSchemaData = async () => {
      if (schemaData !== null && schemaData !== undefined && open) {
        try {
          const autoParseEnabled = await storage.getAutoParseString()
          
          if (autoParseEnabled && schemaTransformer.isStringData(schemaData)) {
            setWasStringData(true)
            const elements = parseMarkdownString(schemaData)
            
            if (elements.length > 0) {
              const formatted = JSON.stringify(elements, null, 2)
              setEditorValue(formatted)
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            } else {
              message.warning('Markdown解析失败，显示原始字符串')
              setWasStringData(false)
              const formatted = JSON.stringify(schemaData, null, 2)
              setEditorValue(formatted)
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            }
          } else {
            setWasStringData(false)
            const formatted = JSON.stringify(schemaData, null, 2)
            setEditorValue(formatted)
            setIsModified(false)
            const result = detectContentType(formatted)
            updateContentType(result)
          }
          
          setTimeout(() => {
            isFirstLoadRef.current = false
          }, 100)
        } catch (error) {
          logger.error('处理Schema数据失败:', error)
          setWasStringData(false)
          const formatted = JSON.stringify(schemaData)
          setEditorValue(formatted)
          setIsModified(false)
          const result = detectContentType(formatted)
          updateContentType(result)
          
          setTimeout(() => {
            isFirstLoadRef.current = false
          }, 100)
        }
      }
    }
    
    processSchemaData()
  }, [schemaData, open, detectContentType, updateContentType])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      setIsModified(true)
      debouncedDetectContent(value)
      
      // Hook内部会判断是否启用自动保存和是否首次加载
      debouncedAutoSaveDraft(value)
    }
  }

  /**
   * 格式化JSON
   */
  const handleFormat = () => {
    const result = schemaTransformer.formatJson(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      showLightNotification('格式化成功')
    } else {
      message.error(`格式化失败: ${result.error}`)
    }
  }

  /**
   * 序列化JSON
   */
  const handleSerialize = () => {
    const result = schemaTransformer.serializeJson(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('序列化成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
    } else {
      message.error(result.error || '序列化失败')
    }
  }

  /**
   * 反序列化JSON
   */
  const handleDeserialize = () => {
    const result = schemaTransformer.deserializeJson(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
      
      if (result.error) {
        message.warning(`${result.error}，已显示当前解析结果`)
      } else if (result.parseCount && result.parseCount > 0) {
        showLightNotification(`反序列化成功（解析层数: ${result.parseCount}）`)
      } else {
        showLightNotification('反序列化成功')
      }
    } else {
      message.error(result.error || '反序列化失败')
    }
  }

  /**
   * 转换为AST
   */
  const handleConvertToAST = () => {
    const result = schemaTransformer.convertToAST(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('转换为AST成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 转换为Markdown
   */
  const handleConvertToMarkdown = () => {
    const result = schemaTransformer.convertToMarkdown(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('转换为RawString成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 处理Segment切换
   */
  const handleSegmentChange = (value: string | number) => {
    if (value === ContentType.Ast) {
      handleConvertToAST()
    } else if (value === ContentType.RawString) {
      handleConvertToMarkdown()
    }
  }

  /**
   * 处理编辑器挂载
   */
  // const handleEditorDidMount = () => {
    // Monaco Editor 挂载完成
  // }

  return (
    <>
      <Drawer
        title={
          <DrawerTitleContainer>
            <DrawerTitleLeft>
              <span>Schema Editor</span>
              {draftAutoSaveStatus === 'success' && (
                <DraftAutoSaveSuccess>
                  ✓ 草稿已自动保存
                </DraftAutoSaveSuccess>
              )}
              {showDraftNotification && (
                <DraftNotification>
                  💾 检测到草稿
                </DraftNotification>
              )}
            </DrawerTitleLeft>
            <DrawerTitleActions>
              <Space size="small">
                {hasDraft && (
                  <>
                    <Tooltip title="加载草稿">
                      <Button size="small" type="text" icon={<FileTextOutlined />} onClick={handleLoadDraft} />
                    </Tooltip>
                    <Tooltip title="删除草稿">
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={handleDeleteDraft} />
                    </Tooltip>
                  </>
                )}
                <Tooltip title="添加到收藏">
                  <Button size="small" type="text" icon={<StarOutlined />} onClick={handleOpenAddFavorite} />
                </Tooltip>
                <Tooltip title="浏览收藏">
                  <Button size="small" type="text" icon={<FolderOpenOutlined />} onClick={handleOpenFavorites} />
                </Tooltip>
              </Space>
            </DrawerTitleActions>
          </DrawerTitleContainer>
        }
        placement="right"
        width={width}
        onClose={onClose}
        open={open}
        destroyOnClose={false}
        closable={true}
        closeIcon={true}
        push={false}
        getContainer={getPortalContainer}
        styles={{
          body: { padding: 0 },
          header: { position: 'relative' }
        }}
        footer={
          <DrawerFooter>
            <Space>
              <Button onClick={handleSaveDraft}>
                保存草稿
              </Button>
              <Button onClick={onClose}>关闭</Button>
              <Button 
                type="primary" 
                onClick={async () => {
                  try {
                    await handleSave()
                  } catch (error: any) {
                    message.error(error.message || '保存失败')
                  }
                }} 
                loading={isSaving} 
                disabled={!isModified}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </Space>
          </DrawerFooter>
        }
      >
        <DrawerContentContainer>
          <DrawerToolbar
            attributes={attributes}
            contentType={contentType}
            canParse={canParse}
            toolbarButtons={toolbarButtons}
            onFormat={handleFormat}
            onSerialize={handleSerialize}
            onDeserialize={handleDeserialize}
            onSegmentChange={handleSegmentChange}
          />

          <EditorContainer>
            {lightNotifications.map((notification, index) => (
              <LightSuccessNotification 
                key={notification.id} 
                style={{ top: `${16 + index * 48}px` }}
              >
                ✓ {notification.text}
              </LightSuccessNotification>
            ))}
            <MonacoErrorBoundary>
              <Editor
                height="100%"
                defaultLanguage="json"
                value={editorValue}
                onChange={handleEditorChange}
                // onMount={handleEditorDidMount}
                theme="vs"
                options={{
                  fontSize: 16,
                  fontFamily: 'Monaco, Menlo, Consolas, monospace',
                  lineNumbers: 'on',
                  folding: true,
                  showFoldingControls: 'always',
                  foldingStrategy: 'indentation',
                  foldingHighlight: true,
                  unfoldOnClickAfterEndOfLine: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  insertSpaces: true,
                  autoIndent: 'full',
                  bracketPairColorization: { enabled: true },
                  matchBrackets: 'always',
                  renderLineHighlight: 'all',
                  quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true
                  }
                }}
              />
            </MonacoErrorBoundary>
          </EditorContainer>
        </DrawerContentContainer>
      </Drawer>

      <FavoritesManager
        shadowRoot={shadowRoot}
        addFavoriteModalVisible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        favoritesModalVisible={favoritesModalVisible}
        favoritesList={favoritesList}
        previewModalVisible={previewModalVisible}
        previewTitle={previewTitle}
        previewContent={previewContent}
        onAddFavoriteInputChange={setFavoriteNameInput}
        onAddFavorite={handleAddFavorite}
        onCloseAddFavoriteModal={closeAddFavoriteModal}
        onCloseFavoritesModal={closeFavoritesModal}
        onPreviewFavorite={handlePreviewFavorite}
        onApplyFavorite={handleApplyFavorite}
        onDeleteFavorite={handleDeleteFavorite}
        onClosePreviewModal={closePreviewModal}
      />
    </>
  )
}

