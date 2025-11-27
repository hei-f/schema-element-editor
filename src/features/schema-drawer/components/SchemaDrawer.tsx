import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import { EDITOR_THEME_OPTIONS } from '@/shared/constants/editor-themes'
import type { EditorTheme, ElementAttributes, HistoryEntry, PreviewFunctionResultPayload, RecordingModeConfig } from '@/shared/types'
import { ContentType, HistoryEntryType, MessageType } from '@/shared/types'
import { listenPageMessages, postMessageToPage } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import { useSchemaRecording } from '../hooks/useSchemaRecording'
import { RecordingPanel } from './RecordingPanel'
import { SchemaDiffView } from './SchemaDiffView'
import {
  BgColorsOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { Button, Drawer, Dropdown, Space, Tooltip, Upload, message } from 'antd'
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
  DrawerTitleLeft,
  PreviewEditorContainer,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer
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
  /** 是否以录制模式打开 */
  isRecordingMode?: boolean
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
  isRecordingMode: initialRecordingMode = false
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
    importExport: true,
    draft: true,
    favorites: true,
    history: true
  })
  const [autoSaveDraft, setAutoSaveDraft] = useState(false)
  
  // 预览相关状态
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [hasPreviewFunction, setHasPreviewFunction] = useState(false)
  const [previewConfig, setPreviewConfig] = useState({
    previewWidth: 40,
    updateDelay: 500,
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

  // 编辑器主题
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('light')
  
  // 录制模式相关状态
  const [isInRecordingMode, setIsInRecordingMode] = useState(false)
  const [isDiffMode, setIsDiffMode] = useState(false)
  const [recordingConfig, setRecordingConfig] = useState<RecordingModeConfig | null>(null)
  const [hasStartedRecording, setHasStartedRecording] = useState(false) // 是否已开始过录制（用于防止停止后重新开始）
  
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

  /**
   * 处理schema变化（录制模式下更新编辑器）
   */
  const handleSchemaChangeForRecording = useCallback((content: string) => {
    editorRef.current?.setValue(content)
    setEditorValue(content)
    const result = detectContentType(content)
    updateContentType(result)
  }, [detectContentType, updateContentType])

  /** Schema录制Hook */
  const {
    isRecording,
    snapshots,
    selectedSnapshotId,
    startRecording,
    stopRecording,
    selectSnapshot,
    clearSnapshots
  } = useSchemaRecording({
    attributes,
    pollingInterval: recordingConfig?.pollingInterval || 100,
    onSchemaChange: handleSchemaChangeForRecording
  })

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
    enabled: toolbarButtons.history,
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
    enabled: toolbarButtons.draft,
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
        const [toolbarConfig, autoSave, preview, historyCount, astHints, expConfig, theme, recConfig] = await Promise.all([
          storage.getToolbarButtons(),
          storage.getAutoSaveDraft(),
          storage.getPreviewConfig(),
          storage.getMaxHistoryCount(),
          storage.getEnableAstTypeHints(),
          storage.getExportConfig(),
          storage.getEditorTheme(),
          storage.getRecordingModeConfig()
        ])
        setToolbarButtons(toolbarConfig)
        setAutoSaveDraft(autoSave)
        setPreviewConfig(preview)
        setMaxHistoryCount(historyCount)
        setEnableAstTypeHints(astHints)
        setExportConfig(expConfig)
        setEditorTheme(theme)
        setRecordingConfig(recConfig)
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
      
      // 禁止背景页面滚动
      document.body.style.overflow = 'hidden'
      
      // 如果是录制模式打开，设置录制状态
      if (initialRecordingMode) {
        setIsInRecordingMode(true)
        setIsDiffMode(false)
        setHasStartedRecording(false) // 重置录制开始标记
      }
    } else {
      // 恢复背景页面滚动
      document.body.style.overflow = ''
      
      // 抽屉关闭时重置录制状态
      setIsInRecordingMode(false)
      setIsDiffMode(false)
      setHasStartedRecording(false)
      stopRecording()
      clearSnapshots()
    }
  }, [open, checkDraft, initialRecordingMode, stopRecording, clearSnapshots])

  /**
   * 录制模式下自动开始录制（只在首次进入时触发）
   */
  useEffect(() => {
    // 只有在录制模式下、还没开始过录制、且数据已准备好时才自动开始
    if (isInRecordingMode && open && recordingConfig && !hasStartedRecording && schemaData !== null) {
      // 延迟一点开始录制，确保编辑器已准备好
      const timer = setTimeout(() => {
        startRecording()
        setHasStartedRecording(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isInRecordingMode, open, recordingConfig, hasStartedRecording, startRecording, schemaData])

  /**
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    const processSchemaData = async () => {
      if (schemaData !== null && schemaData !== undefined && open) {
        try {
          // 录制模式下禁用自动解析，直接显示原始数据
          const autoParseEnabled = isInRecordingMode ? false : await storage.getAutoParseString()
          
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
          } else if (isInRecordingMode && typeof schemaData === 'string') {
            // 录制模式下，字符串直接显示，不经过 JSON.stringify
            // 这样换行符 \n 会正确显示为换行，与录制过程中的数据格式一致
            setWasStringData(true)
            editorRef.current?.setValue(schemaData)
            setEditorValue(schemaData)
            setIsModified(false)
            const result = detectContentType(schemaData)
            updateContentType(result)
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
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      setIsModified(true)
      debouncedDetectContent(value)
      debouncedAutoSaveDraft(value)
      // 用户手动编辑时记录历史
      recordChange(value)
    }
  }, [debouncedDetectContent, debouncedAutoSaveDraft, recordChange])

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
      message.warning('页面未提供预览函数')
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
   * 预览数据与保存数据使用相同的转换逻辑，确保类型一致
   */
  const handleRenderPreview = (isAutoUpdate = false) => {
    if (!previewEnabled || !hasPreviewFunction) {
      return
    }
    
    try {
      // 使用与保存相同的转换逻辑，确保预览数据和保存数据类型一致
      const result = schemaTransformer.prepareSaveData(editorValue, wasStringData)
      
      if (!result.success) {
        message.error('数据转换失败：' + result.error)
        return
      }
      
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
          data: result.data,
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
    // 拖拽开始时隐藏预览容器，避免遮挡
    postMessageToPage({ type: MessageType.HIDE_PREVIEW })
  }

  /**
   * 拖拽中 - 计算并更新预览宽度
   * 拖拽过程中只更新宽度，拖拽结束后再更新预览位置（避免卡顿和不同步）
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
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      
      // 保存用户自定义的宽度到配置
      storage.setPreviewConfig({
        ...previewConfig,
        previewWidth: Math.round(previewWidth)
      })
      
      // 拖拽结束后更新预览位置并显示
      // 使用 setTimeout 等待 React 完成渲染后再获取最终位置
      setTimeout(() => {
        if (previewPlaceholderRef.current) {
          const rect = previewPlaceholderRef.current.getBoundingClientRect()
          const result = schemaTransformer.prepareSaveData(editorValue || '{}', wasStringData)
          if (result.success) {
            // 先更新位置
            postMessageToPage({
              type: MessageType.RENDER_PREVIEW,
              payload: {
                data: result.data,
                position: {
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height
                }
              }
            })
            // 然后显示预览容器
            postMessageToPage({ type: MessageType.SHOW_PREVIEW })
          }
        }
      }, 50)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, previewWidth, editorValue, previewConfig, wasStringData])

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
  const drawerWidth = previewEnabled ? '100vw' : (isInRecordingMode ? '1000px' : width)

  /**
   * 处理停止录制
   */
  const handleStopRecording = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  /**
   * 处理进入Diff模式
   */
  const handleEnterDiffMode = useCallback(() => {
    setIsDiffMode(true)
  }, [])

  /**
   * 处理返回编辑模式（从Diff模式）
   */
  const handleBackToEditor = useCallback(() => {
    setIsDiffMode(false)
  }, [])

  /**
   * 处理选择快照
   */
  const handleSelectSnapshot = useCallback((id: number) => {
    selectSnapshot(id)
  }, [selectSnapshot])

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
              {toolbarButtons.draft && draftAutoSaveStatus === 'success' && (
                <DraftAutoSaveSuccess>
                  ✓ 草稿已自动保存
                </DraftAutoSaveSuccess>
              )}
              {toolbarButtons.draft && showDraftNotification && (
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
                      <Tooltip title="导入">
                        <Button icon={<UploadOutlined />} size="small" type="text" />
                      </Tooltip>
                    </Upload>
                    <Tooltip title="导出">
                      <Button 
                        icon={<DownloadOutlined />} 
                        size="small"
                        type="text"
                        onClick={handleExport}
                        disabled={!canParse}
                      />
                    </Tooltip>
                  </>
                )}
                
                {/* 历史按钮 */}
                {toolbarButtons.history && (
                  <HistoryDropdown
                    history={history}
                    currentIndex={currentIndex}
                    onLoadVersion={loadHistoryVersion}
                    onClearHistory={clearHistory}
                    disabled={!hasHistory}
                  />
                )}
                
                {toolbarButtons.preview && (
                  <Tooltip title={
                    !hasPreviewFunction 
                      ? '页面未提供预览函数' 
                      : previewEnabled ? '关闭预览' : '开启预览'
                  }>
                    <Button
                      size="small"
                      type={previewEnabled ? 'primary' : 'text'}
                      icon={previewEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      onClick={handleTogglePreview}
                      disabled={!hasPreviewFunction}
                    />
                  </Tooltip>
                )}
                
                {toolbarButtons.draft && hasDraft && (
                  <>
                    <Tooltip title="加载草稿">
                      <Button size="small" type="text" icon={<FileTextOutlined />} onClick={handleLoadDraft} />
                    </Tooltip>
                    <Tooltip title="删除草稿">
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={handleDeleteDraft} />
                    </Tooltip>
                  </>
                )}
                {toolbarButtons.favorites && (
                  <>
                    <Tooltip title="添加收藏">
                      <Button size="small" type="text" icon={<StarOutlined />} onClick={handleOpenAddFavorite} />
                    </Tooltip>
                    <Tooltip title="浏览收藏">
                      <Button size="small" type="text" icon={<FolderOpenOutlined />} onClick={handleOpenFavorites} />
                    </Tooltip>
                  </>
                )}
                <Dropdown
                  menu={{
                    items: EDITOR_THEME_OPTIONS.map(t => ({
                      key: t.value,
                      label: t.label,
                      onClick: () => {
                        setEditorTheme(t.value)
                        storage.setEditorTheme(t.value)
                      }
                    })),
                    selectedKeys: [editorTheme]
                  }}
                  trigger={['click']}
                  getPopupContainer={(node) => node.parentNode as HTMLElement}
                >
                  <Tooltip title="切换主题">
                    <Button size="small" type="text" icon={<BgColorsOutlined />} />
                  </Tooltip>
                </Dropdown>
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
              {toolbarButtons.draft && (
                <Button onClick={handleSaveDraft} size="small">
                  保存草稿
                </Button>
              )}
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
          {/* Diff模式 */}
          {isInRecordingMode && isDiffMode ? (
            <SchemaDiffView
              snapshots={snapshots}
              onBackToEditor={handleBackToEditor}
            />
          ) : isInRecordingMode ? (
            // 录制模式：左侧面板 + 右侧编辑器
            <RecordingPanel
              isRecording={isRecording}
              snapshots={snapshots}
              selectedSnapshotId={selectedSnapshotId}
              onStopRecording={handleStopRecording}
              onSelectSnapshot={handleSelectSnapshot}
              onEnterDiffMode={handleEnterDiffMode}
            >
              <DrawerToolbar
                attributes={attributes}
                contentType={contentType}
                canParse={canParse}
                toolbarButtons={toolbarButtons}
                previewEnabled={previewEnabled}
                isRecording={isRecording}
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
                  theme={editorTheme}
                  placeholder="在此输入 JSON Schema..."
                  enableAstHints={enableAstTypeHints}
                  isAstContent={() => contentType === ContentType.Ast}
                />
              </EditorContainer>
            </RecordingPanel>
          ) : previewEnabled ? (
            // 预览模式：工具栏在顶部，预览和编辑器并排
            <PreviewModeContainer>
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
              <PreviewEditorRow ref={previewContainerRef}>
                {/* 左侧预览占位区域 */}
                <PreviewPlaceholder ref={previewPlaceholderRef} $width={previewWidth}>
                  预览区域（在主页面渲染）
                </PreviewPlaceholder>
                
                {/* 可拖拽的分隔条 */}
                <PreviewResizer $isDragging={isDragging} onMouseDown={handleResizeStart} />
                
                {/* 右侧编辑器（不包含工具栏） */}
                <PreviewEditorContainer>
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
                    theme={editorTheme}
                    placeholder="在此输入 JSON Schema..."
                    enableAstHints={enableAstTypeHints}
                    isAstContent={() => contentType === ContentType.Ast}
                  />
                </PreviewEditorContainer>
              </PreviewEditorRow>
            </PreviewModeContainer>
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
              theme={editorTheme}
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

