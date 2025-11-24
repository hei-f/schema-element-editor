import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import type { ElementAttributes, HistoryEntry, PreviewFunctionResultPayload } from '@/shared/types'
import { ContentType, HistoryEntryType, MessageType } from '@/shared/types'
import { listenPageMessages, postMessageToPage } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { Button, Drawer, Space, Tooltip, Upload, message } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useContentDetection } from '../hooks/useContentDetection'
import { useDraftManagement } from '../hooks/useDraftManagement'
import { useEditHistory } from '../hooks/useEditHistory'
import { useFavoritesManagement } from '../hooks/useFavoritesManagement'
import { useFileImportExport } from '../hooks/useFileImportExport'
import { useLightNotifications } from '../hooks/useLightNotifications'
import { useSchemaSave } from '../hooks/useSchemaSave'
import type { ExportMetadata } from '../types/export'
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
import { CodeMirrorEditor, CodeMirrorEditorHandle } from './CodeMirrorEditor'
import { DrawerToolbar } from './DrawerToolbar'
import { HistoryDropdown } from './HistoryDropdown'

interface SchemaDrawerProps {
  open: boolean
  schemaData: any
  attributes: ElementAttributes
  onClose: () => void
  onSave: (data: any) => Promise<void>
  width: number | string
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
  width
}) => {
  const [editorValue, setEditorValue] = useState<string>('')
  const [isModified, setIsModified] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)
  const [toolbarButtons, setToolbarButtons] = useState({
    astRawStringToggle: true,
    deserialize: true,
    serialize: true,
    format: true,
    preview: true,
    importExport: true
  })
  const [autoSaveDraft, setAutoSaveDraft] = useState(false)
  
  // 预览相关状态
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [hasPreviewFunction, setHasPreviewFunction] = useState(false)
  const [previewConfig, setPreviewConfig] = useState({
    previewWidth: 40,
    updateDelay: 500,
    rememberState: false,
    autoUpdate: false
  })
  const [previewWidth, setPreviewWidth] = useState(40) // 预览区域宽度百分比
  const [isDragging, setIsDragging] = useState(false)
  
  // 历史记录配置
  const [maxHistoryCount, setMaxHistoryCount] = useState(50)
  
  // AST 类型提示配置
  const [enableAstTypeHints, setEnableAstTypeHints] = useState(true)
  
  // 导出配置
  const [exportConfig, setExportConfig] = useState({
    customFileName: false
  })
  
  const paramsKey = attributes.params.join(',')
  const isFirstLoadRef = useRef(true)
  const editorRef = useRef<CodeMirrorEditorHandle>(null) // 编辑器命令式 API
  const previewPlaceholderRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

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
      // 记录保存版本
      recordSpecialVersion(HistoryEntryType.Save, '保存版本')
      onClose()
    },
    onSave
  })

  /** 历史版本加载回调（解耦设计） */
  const handleLoadHistoryVersion = useCallback((content: string, entry: HistoryEntry) => {
    // 1. 使用命令式 API 更新编辑器
    editorRef.current?.setValue(content)
    setEditorValue(content)
    setIsModified(true)
    
    // 2. 更新内容类型检测
    const result = detectContentType(content)
    updateContentType(result)
    
    // 3. 预览会自动更新（因为 editorValue 变化会触发现有的 useEffect）
    // 无需显式调用预览更新，保持解耦
    
    // 4. 显示轻量提示
    showLightNotification(`已切换到: ${entry.description || '历史版本'}`)
  }, [detectContentType, updateContentType, showLightNotification])

  /** 导入成功回调 */
  const handleImportSuccess = useCallback((content: string, metadata?: ExportMetadata) => {
    // 1. 使用命令式 API 更新编辑器
    editorRef.current?.setValue(content)
    setEditorValue(content)
    setIsModified(true)
    
    // 2. 恢复 wasStringData 状态
    if (metadata?.wasStringData !== undefined) {
      setWasStringData(metadata.wasStringData)
    }
    
    // 3. 触发内容类型检测
    const result = detectContentType(content)
    updateContentType(result)
  }, [detectContentType, updateContentType])

  /** 文件导入导出功能 */
  const { handleExport, handleImport } = useFileImportExport({
    editorValue,
    paramsKey,
    wasStringData,
    canParse,
    customFileName: exportConfig.customFileName,
    onImportSuccess: handleImportSuccess,
    showLightNotification
  })

  /** 编辑历史管理 */
  const {
    history,
    currentIndex,
    hasHistory,
    recordChange,
    recordSpecialVersion,
    loadHistoryVersion,
    clearHistory
  } = useEditHistory({
    paramsKey,
    editorValue,
    maxHistoryCount,
    onLoadVersion: handleLoadHistoryVersion
  })

  /** 加载草稿内容的回调 */
  const handleLoadDraftContent = useCallback((content: string) => {
    // 使用命令式 API 更新编辑器
    editorRef.current?.setValue(content)
    setEditorValue(content)
    setIsModified(true)
    const result = detectContentType(content)
    updateContentType(result)
    // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
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
    // 使用命令式 API 更新编辑器
    editorRef.current?.setValue(content)
    setEditorValue(content)
    setIsModified(true)
    const result = detectContentType(content)
    updateContentType(result)
    // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
  }, [detectContentType, updateContentType])

  /** 收藏管理 */
  const {
    favoritesList,
    favoritesModalVisible,
    addFavoriteModalVisible,
    favoriteNameInput,
    editModalVisible,
    editingFavoriteId,
    editingName,
    editingContent,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleDeleteFavorite,
    handleEditFavorite,
    handleSaveEdit,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closeEditModal
  } = useFavoritesManagement({
    editorValue,
    isModified,
    onApplyFavorite: handleApplyFavoriteContent,
    onShowLightNotification: showLightNotification,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg)
  })

  /**
   * Portal组件的容器获取函数
   */
  const getPortalContainer = shadowRootManager.getContainer

  /**
   * 加载工具栏按钮配置和草稿配置
   */
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [toolbarConfig, autoSave, preview, historyCount, astHints, expConfig] = await Promise.all([
          storage.getToolbarButtons(),
          storage.getAutoSaveDraft(),
          storage.getPreviewConfig(),
          storage.getMaxHistoryCount(),
          storage.getEnableAstTypeHints(),
          storage.getExportConfig()
        ])
        setToolbarButtons(toolbarConfig)
        setAutoSaveDraft(autoSave)
        setPreviewConfig(preview)
        setMaxHistoryCount(historyCount)
        setEnableAstTypeHints(astHints)
        setExportConfig(expConfig)
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
              // 使用命令式 API 更新编辑器
              editorRef.current?.setValue(formatted)
              setEditorValue(formatted)
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            } else {
              message.warning('Markdown解析失败，显示原始字符串')
              setWasStringData(false)
              const formatted = JSON.stringify(schemaData, null, 2)
              // 使用命令式 API 更新编辑器
              editorRef.current?.setValue(formatted)
              setEditorValue(formatted)
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            }
          } else {
            setWasStringData(false)
            const formatted = JSON.stringify(schemaData, null, 2)
            // 使用命令式 API 更新编辑器
            editorRef.current?.setValue(formatted)
            setEditorValue(formatted)
            setIsModified(false)
          const result = detectContentType(formatted)
          updateContentType(result)
        }
        
        // 记录初始版本（在设置完编辑器值之后）
        if (isFirstLoadRef.current) {
          setTimeout(() => {
            recordSpecialVersion(HistoryEntryType.Initial, '初始加载')
          }, 200)
        }
        
        setTimeout(() => {
          isFirstLoadRef.current = false
        }, 100)
        } catch (error) {
          logger.error('处理Schema数据失败:', error)
          setWasStringData(false)
          const formatted = JSON.stringify(schemaData)
          // 使用命令式 API 更新编辑器
          editorRef.current?.setValue(formatted)
          setEditorValue(formatted)
          setIsModified(false)
          const result = detectContentType(formatted)
          updateContentType(result)
          
          // 记录初始版本（在设置完编辑器值之后）
          if (isFirstLoadRef.current) {
            setTimeout(() => {
              recordSpecialVersion(HistoryEntryType.Initial, '初始加载')
            }, 200)
          }
          
          setTimeout(() => {
            isFirstLoadRef.current = false
          }, 100)
        }
      }
    }
    
    processSchemaData()
  }, [schemaData, open, detectContentType, updateContentType])

  /**
   * 监听编辑器变化，自动记录历史（防抖）
   */
  useEffect(() => {
    if (editorValue && !isFirstLoadRef.current) {
      recordChange(editorValue)
    }
  }, [editorValue, recordChange])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      setIsModified(true)
      debouncedDetectContent(value)
      debouncedAutoSaveDraft(value)
    }
  }, [debouncedDetectContent, debouncedAutoSaveDraft])

  /**
   * 格式化JSON
   */
  const handleFormat = () => {
    const result = schemaTransformer.formatJson(editorValue)
    
    if (result.success && result.data) {
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
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
   * 检查预览函数是否存在
   */
  useEffect(() => {
    if (!open) return
    
    const cleanup = listenPageMessages((msg) => {
      if (msg.type === MessageType.PREVIEW_FUNCTION_RESULT) {
        const payload = msg.payload as PreviewFunctionResultPayload
        setHasPreviewFunction(payload.exists)
        logger.log('预览函数检测结果:', payload.exists)
      }
    })
    
    // 发送检测消息
    postMessageToPage({
      type: MessageType.CHECK_PREVIEW_FUNCTION
    })
    
    return cleanup
  }, [open])

  /**
   * 抽屉关闭时清除预览
   */
  useEffect(() => {
    if (!open && previewEnabled) {
      handleClearPreview()
    }
  }, [open])

  /**
   * 切换预览状态
   */
  const handleTogglePreview = () => {
    if (!hasPreviewFunction) {
      message.warning('页面未提供 __previewContent 函数')
      return
    }
    
    if (previewEnabled) {
      handleClearPreview()
    } else {
      setPreviewEnabled(true)
    }
  }

  /**
   * 当预览开启时，自动渲染第一次
   */
  useEffect(() => {
    if (previewEnabled && hasPreviewFunction) {
      // 延迟一小段时间等待 Drawer 宽度动画完成
      const timer = setTimeout(() => {
        handleRenderPreview()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [previewEnabled, hasPreviewFunction])

  /**
   * 自动更新预览（当开启自动更新时）
   */
  useEffect(() => {
    // 只有当预览开启、自动更新开启、且有预览函数时才自动更新
    if (!previewEnabled || !previewConfig.autoUpdate || !hasPreviewFunction) {
      return
    }
    
    // 使用防抖延迟自动更新预览
    const timer = setTimeout(() => {
      handleRenderPreview(true) // 传入 true 表示自动更新
    }, previewConfig.updateDelay)
    
    return () => clearTimeout(timer)
  }, [editorValue, previewEnabled, previewConfig.autoUpdate, previewConfig.updateDelay, hasPreviewFunction])

  /**
   * 手动渲染预览
   */
  const handleRenderPreview = (isAutoUpdate = false) => {
    if (!previewEnabled || !hasPreviewFunction) {
      return
    }
    
    try {
      // 解析编辑器内容
      const parsedData = JSON.parse(editorValue)
      
      // 计算预览区域位置
      const rect = previewPlaceholderRef.current?.getBoundingClientRect()
      if (!rect) {
        message.error('无法获取预览区域位置')
        return
      }
      
      // 发送渲染消息
      postMessageToPage({
        type: MessageType.RENDER_PREVIEW,
        payload: {
          data: parsedData,
          position: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          }
        }
      })
      
      // 如果是自动更新，显示轻量提示
      if (isAutoUpdate) {
        showLightNotification('预览已更新')
      }
      
      logger.log('预览渲染请求已发送')
    } catch (error: any) {
      message.error('JSON 格式错误：' + error.message)
    }
  }

  /**
   * 清除预览
   */
  const handleClearPreview = () => {
    postMessageToPage({
      type: MessageType.CLEAR_PREVIEW
    })
    setPreviewEnabled(false)
    logger.log('预览已清除')
  }
  
  /**
   * 开始拖拽分隔条
   */
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * 拖拽中 - 计算并更新预览宽度
   */
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!previewContainerRef.current) return

      const containerRect = previewContainerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const mouseX = e.clientX - containerRect.left

      // 计算新的预览宽度百分比
      let newWidth = (mouseX / containerWidth) * 100

      // 限制在 20% - 80% 之间
      newWidth = Math.max(20, Math.min(80, newWidth))

      setPreviewWidth(newWidth)

      // 实时更新预览容器位置
      if (previewPlaceholderRef.current) {
        const rect = previewPlaceholderRef.current.getBoundingClientRect()
        postMessageToPage({
          type: MessageType.RENDER_PREVIEW,
          payload: {
            data: JSON.parse(editorValue || '{}'),
            position: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            }
          }
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      
      // 保存用户自定义的宽度到配置
      storage.setPreviewConfig({
        ...previewConfig,
        previewWidth: Math.round(previewWidth)
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, previewWidth, editorValue, previewConfig])

  /**
   * 加载用户保存的预览宽度
   */
  useEffect(() => {
    if (previewConfig.previewWidth) {
      setPreviewWidth(previewConfig.previewWidth)
    }
  }, [previewConfig.previewWidth])

  /**
   * 计算抽屉宽度
   */
  const drawerWidth = previewEnabled ? '100vw' : width

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
                {/* 导入导出按钮 */}
                {toolbarButtons.importExport && (
                  <>
                    <Upload
                      accept=".json"
                      showUploadList={false}
                      beforeUpload={handleImport}
                      maxCount={1}
                    >
                      <Tooltip title="导入 JSON 文件">
                        <Button icon={<UploadOutlined />} size="small" type="text">
                          导入
                        </Button>
                      </Tooltip>
                    </Upload>
                    
                    <Tooltip title="导出为 JSON 文件">
                      <Button 
                        icon={<DownloadOutlined />} 
                        size="small"
                        type="text"
                        onClick={handleExport}
                        disabled={!canParse}
                      >
                        导出
                      </Button>
                    </Tooltip>
                  </>
                )}
                
                {/* 历史按钮 */}
                <HistoryDropdown
                  history={history}
                  currentIndex={currentIndex}
                  onLoadVersion={loadHistoryVersion}
                  onClearHistory={clearHistory}
                  disabled={!hasHistory}
                />
                
                {toolbarButtons.preview && (
                  <Tooltip title={
                    !hasPreviewFunction 
                      ? '页面未提供 __previewContent 函数' 
                      : previewEnabled 
                        ? '关闭预览' 
                        : '开启预览'
                  }>
                    <Button
                      size="small"
                      type={previewEnabled ? 'primary' : 'text'}
                      icon={previewEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      onClick={handleTogglePreview}
                      disabled={!hasPreviewFunction}
                    >
                      预览
                    </Button>
                  </Tooltip>
                )}
                
                {hasDraft && (
                  <>
                    <Tooltip title="加载草稿">
                      <Button size="small" type="text" icon={<FileTextOutlined />} onClick={handleLoadDraft}>
                        草稿
                      </Button>
                    </Tooltip>
                    <Tooltip title="删除草稿">
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={handleDeleteDraft} />
                    </Tooltip>
                  </>
                )}
                <Tooltip title="添加到收藏">
                  <Button size="small" type="text" icon={<StarOutlined />} onClick={handleOpenAddFavorite}>
                    收藏
                  </Button>
                </Tooltip>
                <Tooltip title="浏览收藏">
                  <Button size="small" type="text" icon={<FolderOpenOutlined />} onClick={handleOpenFavorites} />
                </Tooltip>
              </Space>
            </DrawerTitleActions>
          </DrawerTitleContainer>
        }
        placement="right"
        width={drawerWidth}
        mask={!previewEnabled}
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
              <Button onClick={handleSaveDraft} size="small">
                保存草稿
              </Button>
              <Button onClick={onClose} size="small">关闭</Button>
              <Button 
                type="primary" 
                size="small"
                onClick={async () => {
                  try {
                    await handleSave()
                    // 保存成功后记录特殊版本 - 临时禁用
                    // recordSpecialVersion(HistoryEntryType.Save, '保存版本')
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
          {previewEnabled ? (
            // 预览模式：工具栏在顶部，预览和编辑器并排
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* 工具栏横跨整个宽度 */}
          <DrawerToolbar
            attributes={attributes}
            contentType={contentType}
            canParse={canParse}
            toolbarButtons={toolbarButtons}
                previewEnabled={previewEnabled}
            onFormat={handleFormat}
            onSerialize={handleSerialize}
            onDeserialize={handleDeserialize}
            onSegmentChange={handleSegmentChange}
                onRenderPreview={handleRenderPreview}
              />
              
              {/* 预览区域和编辑器并排 */}
              <div 
                ref={previewContainerRef} 
                style={{ 
                  display: 'flex', 
                  flex: 1,
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* 左侧预览占位区域 */}
                <div
                  ref={previewPlaceholderRef}
                  style={{
                    width: `${previewWidth}%`,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '14px',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                >
                  预览区域（在主页面渲染）
                </div>
                
                {/* 可拖拽的分隔条 */}
                <div
                  style={{
                    width: '8px',
                    height: '100%',
                    background: isDragging ? '#1890ff' : '#d9d9d9',
                    cursor: 'col-resize',
                    flexShrink: 0,
                    position: 'relative',
                    transition: 'background 0.2s',
                    borderLeft: '1px solid #bfbfbf',
                    borderRight: '1px solid #bfbfbf',
                    userSelect: 'none',
                    zIndex: 10
                  }}
                  onMouseDown={handleResizeStart}
                  onMouseEnter={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.background = '#1890ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.background = '#d9d9d9'
                    }
                  }}
                />
                
                {/* 右侧编辑器（不包含工具栏） */}
                <EditorContainer style={{ flex: 1, minWidth: 0 }}>
                  {lightNotifications.map((notification, index) => (
                    <LightSuccessNotification 
                      key={notification.id} 
                      style={{ top: `${16 + index * 48}px` }}
                    >
                      ✓ {notification.text}
                    </LightSuccessNotification>
                  ))}
                  <CodeMirrorEditor
                    ref={editorRef}
                    height="100%"
                    defaultValue={editorValue}
                    onChange={handleEditorChange}
                    theme="light"
                    placeholder="在此输入 JSON Schema..."
                    enableAstHints={enableAstTypeHints}
                    isAstContent={() => contentType === ContentType.Ast}
                  />
                </EditorContainer>
              </div>
            </div>
          ) : (
            // 普通编辑模式
            <>
              <DrawerToolbar
                attributes={attributes}
                contentType={contentType}
                canParse={canParse}
                toolbarButtons={toolbarButtons}
                previewEnabled={previewEnabled}
                onFormat={handleFormat}
                onSerialize={handleSerialize}
                onDeserialize={handleDeserialize}
                onSegmentChange={handleSegmentChange}
                onRenderPreview={handleRenderPreview}
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
            <CodeMirrorEditor
              ref={editorRef}
              height="100%"
              defaultValue={editorValue}
              onChange={handleEditorChange}
              theme="light"
              placeholder="在此输入 JSON Schema..."
              enableAstHints={enableAstTypeHints}
              isAstContent={() => contentType === ContentType.Ast}
            />
          </EditorContainer>
            </>
          )}
        </DrawerContentContainer>
      </Drawer>

      <FavoritesManager
        addFavoriteModalVisible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        favoritesModalVisible={favoritesModalVisible}
        favoritesList={favoritesList}
        editModalVisible={editModalVisible}
        editingFavoriteId={editingFavoriteId}
        editingName={editingName}
        editingContent={editingContent}
        onAddFavoriteInputChange={setFavoriteNameInput}
        onAddFavorite={handleAddFavorite}
        onCloseAddFavoriteModal={closeAddFavoriteModal}
        onCloseFavoritesModal={closeFavoritesModal}
        onEditFavorite={handleEditFavorite}
        onApplyFavorite={handleApplyFavorite}
        onDeleteFavorite={handleDeleteFavorite}
        onSaveEdit={handleSaveEdit}
        onCloseEditModal={closeEditModal}
      />
    </>
  )
}

