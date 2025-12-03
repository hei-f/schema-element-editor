import {
  PREVIEW_CONTAINER_ID,
  previewContainerManager,
} from '@/core/content/core/preview-container'
import { shadowDomContainerManager } from '@/core/content/core/shadow-dom'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FULL_SCREEN_MODE, type FullScreenMode } from '@/shared/constants/ui-modes'
import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import type {
  DrawerShortcutsConfig,
  ElementAttributes,
  HistoryEntry,
  SchemaDrawerConfig,
} from '@/shared/types'
import { HistoryEntryType, MessageType } from '@/shared/types'
import { postMessageToPage, sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { useDrawerShortcuts } from '../hooks/ui/useDrawerShortcuts'
import { useFullScreenMode } from '../hooks/ui/useFullScreenMode'
import { useResizer } from '../hooks/ui/useResizer'
import { useSchemaRecording } from '../hooks/schema/useSchemaRecording'
import { App, Drawer } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCommunicationMode } from '@/shared/utils/communication-mode'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import { useLatest } from '@/shared/hooks/useLatest'
import { useContentDetection } from '../hooks/schema/useContentDetection'
import { useDraftManagement } from '../hooks/storage/useDraftManagement'
import { useEditHistory } from '../hooks/storage/useEditHistory'
import { useFavoritesManagement } from '../hooks/storage/useFavoritesManagement'
import { useFileImportExport } from '../hooks/storage/useFileImportExport'
import { useLightNotifications } from '../hooks/ui/useLightNotifications'
import { useSchemaSave } from '../hooks/schema/useSchemaSave'
import { useToolbarActions } from '../hooks/editor/useToolbarActions'
import { useJsonRepair } from '../hooks/editor/useJsonRepair'
import type { EditorUpdateOptions } from '../types/editor'
import type { ExportMetadata } from '../types/export'
import { schemaTransformer } from '../services/schema-transformer'
import { getEditorThemeVars } from '../styles/editor/editor-theme-vars'
import type { CodeMirrorEditorHandle } from './editor/CodeMirrorEditor'
import { DrawerContent } from './DrawerContent'
import { DrawerFooter } from './DrawerFooter'
import { DrawerTitle } from './DrawerTitle'
import { formatSchemaContent as formatSchemaContentUtil } from '../utils/schema-content-formatter'

interface SchemaDrawerProps {
  open: boolean
  schemaData: any
  attributes: ElementAttributes
  onClose: () => void
  onSave: (data: any) => Promise<void>
  /** 是否以录制模式打开 */
  isRecordingMode?: boolean
  /** 抽屉配置 */
  config: SchemaDrawerConfig
  /** 宿主环境是否存在预览函数 */
  hasPreviewFunction: boolean
  /** 快捷键配置 */
  shortcuts: DrawerShortcutsConfig
}

/**
 * Schema编辑器抽屉组件
 */
export const SchemaDrawer: React.FC<SchemaDrawerProps> = ({
  open,
  schemaData,
  attributes,
  onClose,
  onSave,
  isRecordingMode: initialRecordingMode = false,
  config,
  hasPreviewFunction,
  shortcuts,
}) => {
  // 使用 App.useApp() 获取 message 实例，确保在 Shadow DOM 中正确显示
  const { message } = App.useApp()

  // 从 config 解构配置
  const {
    width,
    apiConfig,
    toolbarButtons,
    autoSaveDraft,
    previewConfig,
    maxHistoryCount,
    enableAstTypeHints,
    exportConfig,
    editorTheme: initialEditorTheme,
    recordingModeConfig: recordingConfig,
    autoParseString: autoParseEnabled,
  } = config

  /** 通信模式 */
  const { isPostMessageMode } = getCommunicationMode(apiConfig)

  // 编辑器主题（支持运行时切换，初始值从 config 获取）
  const [editorTheme, setEditorTheme] = useState(initialEditorTheme)

  // 根据编辑器主题计算 styled-components 主题变量
  const editorThemeVars = useMemo(() => getEditorThemeVars(editorTheme), [editorTheme])

  const [editorValue, setEditorValue] = useState<string>('')
  const [originalValue, setOriginalValue] = useState<string>('') // 原始值，用于 diff 对比
  const [isModified, setIsModified] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)

  // 全屏模式状态管理
  const {
    setMode: setFullScreenMode,
    reset: resetFullScreenMode,
    isPreview: previewEnabled,
    isDiff: isDiffMode,
    isFullScreenTransition,
  } = useFullScreenMode()

  const [previewWidth, setPreviewWidth] = useState(previewConfig.previewWidth)

  // 录制模式相关状态
  const [isInRecordingMode, setIsInRecordingMode] = useState(false)

  const paramsKey = attributes.params.join(',')
  const isFirstLoadRef = useRef(true)
  const editorRef = useRef<CodeMirrorEditorHandle>(null) // 编辑器命令式 API
  const previewPlaceholderRef = useRef<HTMLDivElement>(null)

  /** 内容类型检测 */
  const { contentType, canParse, detectContentType, debouncedDetectContent, updateContentType } =
    useContentDetection()

  /**
   * 统一的编辑器内容更新方法
   * 同时更新编辑器视图和 React state，确保始终同步
   * 解决双重 setValue 的问题，避免遗漏同步
   */
  const updateEditorContent = useCallback(
    (content: string, options: EditorUpdateOptions = {}) => {
      const {
        markModified = false,
        modifiedValue = true,
        updateOriginal = false,
        detectType = true,
        wasStringData: wasStringDataValue,
      } = options

      // 1. 同步更新编辑器视图和 React state（核心操作）
      editorRef.current?.setValue(content)
      setEditorValue(content)

      // 2. 根据选项执行副作用
      if (markModified) {
        setIsModified(modifiedValue)
      }
      if (updateOriginal) {
        setOriginalValue(content)
      }
      if (wasStringDataValue !== undefined) {
        setWasStringData(wasStringDataValue)
      }
      if (detectType) {
        const result = detectContentType(content)
        updateContentType(result)
      }
    },
    [detectContentType, updateContentType]
  )

  //TODO-youling:CR check point
  /** Schema录制Hook */
  const {
    isRecording,
    snapshots,
    selectedSnapshotId,
    startRecording,
    stopRecording,
    selectSnapshot,
    clearSnapshots,
  } = useSchemaRecording({
    attributes,
    pollingInterval: recordingConfig?.pollingInterval || 100,
    onSchemaChange: updateEditorContent,
    apiConfig,
  })

  /** 轻量提示 */
  const { lightNotifications, showLightNotification } = useLightNotifications()

  /**
   * 获取需要检测/修复的内容
   * 如果当前内容是有效的 JSON 字符串，则返回字符串内部的内容
   */
  const getContentToAnalyze = useCallback(
    (value: string): { content: string; isInnerContent: boolean } => {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'string') {
          return { content: parsed, isInnerContent: true }
        }
        return { content: value, isInnerContent: false }
      } catch {
        return { content: value, isInnerContent: false }
      }
    },
    []
  )

  /** 工具栏操作 */
  const {
    handleFormat,
    handleEscape,
    handleUnescape,
    handleCompact,
    handleParse,
    handleSegmentChange,
  } = useToolbarActions({
    editorValue,
    updateEditorContent,
    showLightNotification,
    showError: (msg) => message.error(msg),
    showWarning: (msg) => message.warning(msg),
  })

  /**
   * 清理预览容器（纯清理，不改变状态）
   * 先立即清除 DOM（同步），再异步通知宿主
   */
  const cleanupPreviewContainer = useCallback(() => {
    // 立即清除 DOM 容器（同步操作，无延迟）
    previewContainerManager.clear()
    logger.log('预览容器已清理')

    // 异步通知宿主清理其内部状态
    if (isPostMessageMode) {
      const messageType =
        apiConfig?.messageTypes?.cleanupPreview ??
        DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview
      sendRequestToHost(
        messageType,
        { containerId: PREVIEW_CONTAINER_ID },
        2,
        apiConfig?.sourceConfig
      ).catch((error) => {
        logger.warn('预览容器清理请求失败:', error)
      })
    } else {
      postMessageToPage({
        type: MessageType.CLEAR_PREVIEW,
      })
    }
  }, [apiConfig, isPostMessageMode])

  /**
   * 处理抽屉关闭
   * 在动画开始前立即清理预览容器和恢复滚动条，确保与抽屉关闭同步
   */
  const handleClose = useCallback(() => {
    // 立即恢复 body 滚动（与点击同步，避免等待动画）
    document.body.style.overflow = ''
    // 立即清理预览容器（与抽屉关闭同步）
    cleanupPreviewContainer()
    // 调用原始关闭回调
    onClose()
  }, [cleanupPreviewContainer, onClose])

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
      handleClose()
    },
    onSave,
  })

  /** 历史版本加载回调（解耦设计） */
  const handleLoadHistoryVersion = useCallback(
    (content: string, entry: HistoryEntry) => {
      updateEditorContent(content, { markModified: true })
      // 预览会自动更新（因为 editorValue 变化会触发现有的 useEffect）
      showLightNotification(`已切换到: ${entry.description || '历史版本'}`)
    },
    [updateEditorContent, showLightNotification]
  )

  /** 导入成功回调 */
  const handleImportSuccess = useCallback(
    (content: string, metadata?: ExportMetadata) => {
      updateEditorContent(content, {
        markModified: true,
        wasStringData: metadata?.wasStringData,
      })
    },
    [updateEditorContent]
  )

  /** 文件导入导出功能 */
  const { handleExport, handleImport } = useFileImportExport({
    editorValue,
    paramsKey,
    wasStringData,
    canParse,
    customFileName: exportConfig.customFileName,
    onImportSuccess: handleImportSuccess,
    showLightNotification,
  })

  /** 编辑历史管理 */
  const {
    history,
    currentIndex,
    hasHistory,
    recordChange,
    recordSpecialVersion,
    loadHistoryVersion,
    clearHistory,
  } = useEditHistory({
    paramsKey,
    editorValue,
    maxHistoryCount,
    enabled: toolbarButtons.history,
    onLoadVersion: handleLoadHistoryVersion,
  })

  /** 加载草稿内容的回调 */
  const handleLoadDraftContent = useCallback(
    (content: string) => {
      updateEditorContent(content, { markModified: true })
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [updateEditorContent]
  )

  /** 草稿管理 */
  const {
    hasDraft,
    showDraftNotification,
    draftAutoSaveStatus,
    checkDraft,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    debouncedAutoSaveDraft,
  } = useDraftManagement({
    paramsKey,
    editorValue,
    isModified,
    autoSaveDraft,
    isFirstLoad: isFirstLoadRef.current,
    enabled: toolbarButtons.draft,
    onLoadDraft: handleLoadDraftContent,
    onSuccess: (msg) => showLightNotification(msg),
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
  })

  /** 应用收藏内容的回调 */
  const handleApplyFavoriteContent = useCallback(
    (content: string) => {
      updateEditorContent(content, { markModified: true })
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [updateEditorContent]
  )

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
    closeEditModal,
  } = useFavoritesManagement({
    editorValue,
    isModified,
    onApplyFavorite: handleApplyFavoriteContent,
    onShowLightNotification: showLightNotification,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
  })

  /**
   * Portal组件的容器获取函数
   */
  const getPortalContainer = shadowRootManager.getContainer

  /**
   * 抽屉打开/关闭回调 - 统一处理生命周期逻辑
   * 注意：滚动条隐藏在 ContentApp 的打开回调中处理，滚动条恢复在此处理（动画完成后）
   */
  const handleAfterOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        // 打开时的初始化逻辑
        isFirstLoadRef.current = true
        checkDraft()

        // 如果是录制模式打开，设置录制状态并自动开始录制
        if (initialRecordingMode && recordingConfig && schemaData !== undefined) {
          setIsInRecordingMode(true)
          resetFullScreenMode()

          // 延迟自动开始录制
          setTimeout(() => {
            startRecording()
          }, 200)
        }
      } else {
        // 关闭时的清理逻辑（动画完成后）
        // 注意：overflow 清除已移至 handleClose，在点击时立即执行

        // 重置所有模式状态
        setIsInRecordingMode(false)
        resetFullScreenMode()
        stopRecording()
        clearSnapshots()
      }
    },
    [
      checkDraft,
      initialRecordingMode,
      recordingConfig,
      schemaData,
      startRecording,
      stopRecording,
      clearSnapshots,
    ]
  )

  /**
   * 格式化 Schema 数据，返回用于编辑器显示的内容
   * 使用提取的纯函数，处理可能的警告信息
   */
  const formatSchemaContent = useCallback(
    (data: unknown): { content: string; wasStringData: boolean } => {
      const result = formatSchemaContentUtil(data, {
        isRecordingMode: isInRecordingMode,
        autoParseEnabled,
      })

      // 如果有警告，显示给用户
      if (result.warning) {
        message.warning(result.warning)
      }

      return { content: result.content, wasStringData: result.wasStringData }
    },
    [isInRecordingMode, autoParseEnabled, message]
  )

  /**
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    // 卫语句：schemaData 未加载或抽屉未打开时不更新
    if (schemaData === undefined || !open) {
      return
    }

    const initLoadOptions = {
      markModified: true,
      modifiedValue: false,
      updateOriginal: true,
    } as const

    try {
      const { content, wasStringData } = formatSchemaContent(schemaData)
      updateEditorContent(content, { ...initLoadOptions, wasStringData })
    } catch (error) {
      logger.error('处理Schema数据失败:', error)
      updateEditorContent(JSON.stringify(schemaData), { ...initLoadOptions, wasStringData: false })
    } finally {
      setTimeout(() => {
        isFirstLoadRef.current = false
      }, 100)
    }
  }, [schemaData, open, formatSchemaContent, updateEditorContent])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setEditorValue(value)
        setIsModified(true)
        debouncedDetectContent(value)
        debouncedAutoSaveDraft(value)
        // 用户手动编辑时记录历史
        recordChange(value)
      }
    },
    [debouncedDetectContent, debouncedAutoSaveDraft, recordChange]
  )

  /**
   * 拖拽结束回调 - 保存配置并重新渲染预览
   */
  const handleResizeEnd = useCallback(
    async (finalWidth: number) => {
      // 保存用户自定义的宽度到配置
      storage.setPreviewConfig({
        ...previewConfig,
        previewWidth: finalWidth,
      })
      setPreviewWidth(finalWidth)

      // 更新预览位置并显示
      if (previewPlaceholderRef.current) {
        const rect = previewPlaceholderRef.current.getBoundingClientRect()
        const position = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        // 更新容器位置
        previewContainerManager.updatePosition(position)

        // 重新渲染预览内容
        const result = schemaTransformer.prepareSaveData(editorValue || '{}', wasStringData)
        if (result.success) {
          const containerId = PREVIEW_CONTAINER_ID

          if (isPostMessageMode) {
            const messageType =
              apiConfig?.messageTypes?.renderPreview ??
              DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
            await sendRequestToHost(
              messageType,
              { schema: result.data, containerId },
              apiConfig?.requestTimeout ?? 5,
              apiConfig?.sourceConfig
            ).catch((error) => {
              logger.warn('拖拽结束后预览渲染请求失败:', error)
            })
          } else {
            postMessageToPage({
              type: MessageType.RENDER_PREVIEW,
              payload: {
                schema: result.data,
                containerId,
                position,
              },
            })
          }
        }

        // 显示预览容器
        previewContainerManager.show()
      }
    },
    [previewConfig, editorValue, wasStringData, isPostMessageMode, apiConfig]
  )

  /** 拖拽分隔条 Hook */
  const {
    width: resizerWidth,
    isDragging,
    containerRef: previewContainerRef,
    handleResizeStart,
  } = useResizer({
    initialWidth: previewWidth,
    onResizeEnd: handleResizeEnd,
  })

  // 同步 resizer 宽度到组件状态（用于 UI 显示）
  useEffect(() => {
    if (isDragging) {
      setPreviewWidth(resizerWidth)
    }
  }, [resizerWidth, isDragging])

  /**
   * 切换全屏模式
   * 自动处理模式切换时的清理逻辑和 z-index 调整
   */
  const switchFullScreenMode = useCallback(
    (newMode: FullScreenMode) => {
      setFullScreenMode((prevMode) => {
        // 退出预览模式时清理预览容器并恢复 z-index
        if (prevMode === FULL_SCREEN_MODE.PREVIEW && newMode !== FULL_SCREEN_MODE.PREVIEW) {
          cleanupPreviewContainer()
          shadowDomContainerManager.resetZIndex()
        }

        // 进入预览模式时降低 z-index，使预览容器能显示
        if (newMode === FULL_SCREEN_MODE.PREVIEW && prevMode !== FULL_SCREEN_MODE.PREVIEW) {
          shadowDomContainerManager.setZIndex(previewConfig.zIndex.preview - 1)
        }

        return newMode
      })
    },
    [cleanupPreviewContainer, previewConfig.zIndex.preview]
  )

  /** JSON 修复操作 */
  const {
    repairOriginalValue,
    pendingRepairedValue,
    handleLocateError,
    handleRepairJson,
    handleApplyRepair,
    handleCancelRepair,
    handleBackToEditor,
  } = useJsonRepair({
    editorValue,
    editorRef,
    getContentToAnalyze,
    updateEditorContent,
    switchFullScreenMode,
    showLightNotification,
    showError: (msg) => message.error(msg),
    showWarning: (msg) => message.warning(msg),
  })

  /**
   * 切换预览状态
   */
  const handleTogglePreview = useCallback(() => {
    if (!hasPreviewFunction) {
      message.warning('页面未提供预览函数')
      return
    }

    if (previewEnabled) {
      switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    } else {
      switchFullScreenMode(FULL_SCREEN_MODE.PREVIEW)
    }
  }, [hasPreviewFunction, previewEnabled, switchFullScreenMode])

  /**
   * 快捷键保存处理函数
   */
  const handleShortcutSave = useCallback(async () => {
    if (!isModified || isSaving) return
    try {
      await handleSave()
    } catch (error: any) {
      message.error(error.message || '保存失败')
    }
  }, [isModified, isSaving, handleSave, message])

  /**
   * 手动渲染预览
   * 预览数据与保存数据使用相同的转换逻辑，确保类型一致
   */
  const handleRenderPreview = useCallback(
    async (isAutoUpdate = false) => {
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

        const position = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        // 由 Content Script 创建预览容器
        const containerId = previewContainerManager.createContainer(position)

        if (isPostMessageMode) {
          // postMessage 直连模式：发送 schema 和 containerId 给宿主
          try {
            const messageType =
              apiConfig?.messageTypes?.renderPreview ??
              DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
            await sendRequestToHost(
              messageType,
              { schema: result.data, containerId },
              apiConfig?.requestTimeout ?? 5,
              apiConfig?.sourceConfig
            )
            logger.log('预览渲染请求已发送（postMessage 模式）')
          } catch (error: any) {
            message.error('预览渲染失败：' + error.message)
            // 显示错误信息到容器
            const container = document.getElementById(containerId)
            if (container) {
              container.innerHTML = `
              <div style="color: red; padding: 20px;">
                <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
                <div style="font-size: 12px;">${error.message || '未知错误'}</div>
              </div>
            `
            }
            return
          }
        } else {
          // windowFunction 模式：通过 injected.js
          postMessageToPage({
            type: MessageType.RENDER_PREVIEW,
            payload: {
              schema: result.data,
              containerId,
              position,
            },
          })
          logger.log('预览渲染请求已发送（windowFunction 模式）')
        }

        // 如果是自动更新，显示轻量提示
        if (isAutoUpdate) {
          showLightNotification('预览已更新')
        }
      } catch (error: any) {
        message.error('JSON 格式错误：' + error.message)
      }
    },
    [
      previewEnabled,
      hasPreviewFunction,
      editorValue,
      wasStringData,
      isPostMessageMode,
      apiConfig,
      showLightNotification,
    ]
  )

  /** 保存最新的 handleRenderPreview 引用，避免 effect 依赖变化 */
  const handleRenderPreviewRef = useLatest(handleRenderPreview)

  /**
   * 当预览开启时，自动渲染第一次
   * 延迟 300ms 等待 Drawer 宽度动画完成
   */
  useDeferredEffect(() => handleRenderPreviewRef.current(), [previewEnabled], {
    delay: 300,
    enabled: previewEnabled && hasPreviewFunction,
  })

  /**
   * 自动更新预览（当开启自动更新时）
   */
  useDeferredEffect(() => handleRenderPreviewRef.current(true), [editorValue], {
    delay: previewConfig.updateDelay,
    enabled: previewEnabled && previewConfig.autoUpdate && hasPreviewFunction,
  })

  /**
   * 打开或更新预览（快捷键专用）
   * 预览关闭时：打开预览
   * 预览打开时：更新预览内容
   */
  const handleOpenOrUpdatePreview = useCallback(() => {
    if (!hasPreviewFunction) {
      message.warning('页面未提供预览函数')
      return
    }

    if (previewEnabled) {
      // 预览已打开，触发更新
      handleRenderPreview()
    } else {
      // 预览未打开，打开预览
      switchFullScreenMode(FULL_SCREEN_MODE.PREVIEW)
    }
  }, [hasPreviewFunction, previewEnabled, switchFullScreenMode, handleRenderPreview])

  /**
   * 关闭预览（快捷键专用）
   */
  const handleClosePreview = useCallback(() => {
    if (previewEnabled) {
      switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    }
  }, [previewEnabled, switchFullScreenMode])

  /** 注册抽屉快捷键 */
  useDrawerShortcuts({
    shortcuts,
    isOpen: open,
    onSave: handleShortcutSave,
    onFormat: handleFormat,
    onOpenOrUpdatePreview: handleOpenOrUpdatePreview,
    onClosePreview: handleClosePreview,
    canSave: isModified && !isSaving,
    canFormat: canParse,
    isPreviewOpen: previewEnabled,
    hasPreviewFunction,
  })

  /**
   * 计算抽屉宽度
   */
  const drawerWidth = previewEnabled || isDiffMode ? '100vw' : isInRecordingMode ? '1000px' : width

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
    switchFullScreenMode(FULL_SCREEN_MODE.DIFF)
  }, [switchFullScreenMode])
  /**
   * 处理选择快照
   */
  const handleSelectSnapshot = useCallback(
    (id: number) => {
      selectSnapshot(id)
    },
    [selectSnapshot]
  )

  return (
    <>
      <Drawer
        title={
          <DrawerTitle
            toolbarButtons={toolbarButtons}
            draftAutoSaveStatus={draftAutoSaveStatus}
            showDraftNotification={showDraftNotification}
            onImport={handleImport}
            canParse={canParse}
            onExport={handleExport}
            history={history}
            currentIndex={currentIndex}
            onLoadVersion={loadHistoryVersion}
            onClearHistory={clearHistory}
            hasHistory={hasHistory}
            hasPreviewFunction={hasPreviewFunction}
            previewEnabled={previewEnabled}
            onTogglePreview={handleTogglePreview}
            hasDraft={hasDraft}
            onLoadDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            onOpenAddFavorite={handleOpenAddFavorite}
            onOpenFavorites={handleOpenFavorites}
            editorTheme={editorTheme}
            onEditorThemeChange={setEditorTheme}
          />
        }
        placement="right"
        width={drawerWidth}
        mask={!previewEnabled}
        onClose={handleClose}
        open={open}
        afterOpenChange={handleAfterOpenChange}
        destroyOnClose={false}
        closable={true}
        closeIcon={true}
        push={false}
        getContainer={getPortalContainer}
        styles={{
          body: { padding: 0 },
          header: { position: 'relative' },
        }}
        footer={
          <DrawerFooter
            toolbarButtons={toolbarButtons}
            onSaveDraft={handleSaveDraft}
            onClose={onClose}
            onSave={handleSave}
            isSaving={isSaving}
            isModified={isModified}
            onError={(msg) => message.error(msg)}
          />
        }
      >
        <DrawerContent
          isDiffMode={isDiffMode}
          isInRecordingMode={isInRecordingMode}
          previewEnabled={previewEnabled}
          editorThemeVars={editorThemeVars}
          baseProps={{
            attributes,
            contentType,
            canParse,
            toolbarButtons,
            toolbarActions: {
              onFormat: handleFormat,
              onEscape: handleEscape,
              onUnescape: handleUnescape,
              onCompact: handleCompact,
              onParse: handleParse,
              onSegmentChange: handleSegmentChange,
              onRenderPreview: handleRenderPreview,
              onLocateError: handleLocateError,
              onRepairJson: handleRepairJson,
              onEnterDiffMode: handleEnterDiffMode,
              onExitDiffMode: handleBackToEditor,
            },
            editorProps: {
              editorRef,
              editorValue,
              editorTheme,
              enableAstTypeHints,
              contentType,
              onChange: handleEditorChange,
            },
            notificationProps: {
              lightNotifications,
            },
          }}
          diffModeProps={{
            isFullScreenTransition,
            isInRecordingMode,
            snapshots,
            originalValue,
            repairOriginalValue,
            pendingRepairedValue,
            editorValue,
            onApplyRepair: handleApplyRepair,
            onCancelRepair: handleCancelRepair,
          }}
          recordingModeProps={{
            isRecording,
            snapshots,
            selectedSnapshotId,
            previewEnabled,
            onStopRecording: handleStopRecording,
            onSelectSnapshot: handleSelectSnapshot,
            onEnterDiffMode: handleEnterDiffMode,
          }}
          previewModeProps={{
            isFullScreenTransition,
            previewEnabled,
            previewWidth,
            isDragging,
            previewContainerRef,
            previewPlaceholderRef,
            onResizeStart: handleResizeStart,
          }}
          normalModeProps={{
            previewEnabled,
          }}
        />
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
