import {
  PREVIEW_CONTAINER_ID,
  previewContainerManager,
} from '@/core/content/core/preview-container'
import { shadowDomContainerManager } from '@/core/content/core/shadow-dom'
import { DEFAULT_VALUES, RECORDING_PANEL_WIDTH } from '@/shared/constants/defaults'
import { FULL_SCREEN_MODE, type FullScreenMode } from '@/shared/constants/ui-modes'
import { FavoritesManager } from '@/features/favorites/components/FavoritesManager.lazy'
import { AddTagModal } from '@/features/favorites/components/AddTagModal.lazy'
import { generate } from '@ant-design/colors'
import type {
  ConfigPreset,
  DrawerShortcutsConfig,
  ElementAttributes,
  HistoryEntry,
  SchemaDrawerConfig,
} from '@/shared/types'
import { ContentType, HistoryEntryType } from '@/shared/types'
import { sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { useDrawerShortcuts } from '../hooks/ui/useDrawerShortcuts'
import { useFullScreenMode } from '../hooks/ui/useFullScreenMode'
import { useResizer } from '../hooks/ui/useResizer'
import { useSchemaRecording } from '../hooks/schema/useSchemaRecording'
import { App, Drawer } from 'antd'
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useEditorContextMenu } from '../hooks/editor/useEditorContextMenu'
import type { EditorUpdateOptions } from '../types/editor'
import type { ExportMetadata } from '../types/export'
import { schemaTransformer } from '../services/schema-transformer'
import { getEditorThemeVars } from '../styles/editor/editor-theme-vars'
import type { CodeMirrorEditorHandle } from './editor/CodeMirrorEditor'
import { CloseIcon } from '@/shared/icons/drawer/title/CloseIcon'
import { DrawerContent } from './DrawerContent'
import { DrawerFooter } from './DrawerFooter'
import { DrawerTitle } from './DrawerTitle'
import { formatSchemaContent as formatSchemaContentUtil } from '../utils/schema-content-formatter'
import { EditorContextMenu } from './context-menu/EditorContextMenu.lazy'
import { QuickEditModal } from './context-menu/QuickEditModal.lazy'

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
    themeColor,
    contextMenuConfig,
  } = config

  // 编辑器主题（支持运行时切换，初始值从 config 获取）
  const [editorTheme, setEditorTheme] = useState(initialEditorTheme)

  // 根据编辑器主题计算 styled-components 主题变量
  const editorThemeVars = useMemo(() => getEditorThemeVars(editorTheme), [editorTheme])

  // 计算主题色梯度，用于传递给需要动态主题色的组件
  const themeColors = useMemo(() => {
    const colors = generate(themeColor)
    return {
      primaryColor: colors[5],
      hoverColor: colors[4],
      activeColor: colors[6],
    }
  }, [themeColor])

  const [editorValue, setEditorValue] = useState<string>('')
  const [originalValue, setOriginalValue] = useState<string>('') // 原始值，用于 diff 对比
  const [isModified, setIsModified] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)

  // 收藏数量状态
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [maxFavoriteCount, setMaxFavoriteCount] = useState(50)

  // 全屏模式状态管理
  const {
    setMode: setFullScreenMode,
    reset: resetFullScreenMode,
    isPreview: previewEnabled,
    isDiff: isDiffMode,
    isFullScreenTransition,
    isClosingPreview,
    isOpeningPreview,
    isOpeningTransition,
    closePreviewWithTransition,
    openPreviewWithTransition,
  } = useFullScreenMode()

  const [previewWidth, setPreviewWidth] = useState(previewConfig.previewWidth)

  /**
   * 抽屉宽度（数值类型，用于 resizable）
   * 从默认值解析初始宽度
   */
  const [drawerSize, setDrawerSize] = useState<number>(() => {
    const defaultWidth = DEFAULT_VALUES.drawerWidth
    return parseInt(defaultWidth, 10) || 800
  })

  // 录制模式相关状态
  const [isInRecordingMode, setIsInRecordingMode] = useState(initialRecordingMode)

  /**
   * 同步外部传入的录制模式状态
   * 当抽屉打开时立即设置，避免等待 afterOpenChange 动画完成后才切换
   */
  useEffect(() => {
    if (open) {
      setIsInRecordingMode(initialRecordingMode)
      if (initialRecordingMode) {
        resetFullScreenMode()
      }
    }
  }, [open, initialRecordingMode, resetFullScreenMode])

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
    // 录制模式下跳过内容类型检测以提升性能，录制结束后再统一检测
    onSchemaChange: (content) => updateEditorContent(content, { detectType: false }),
    apiConfig,
    autoStopTimeout: recordingConfig?.autoStopTimeout,
    onAutoStop: () => {
      message.info('数据无变化，录制已自动停止')
    },
    pollingInterval: recordingConfig?.pollingInterval,
    dataFetchMode: recordingConfig?.dataFetchMode,
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
  }, [apiConfig])

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
    isRecordingMode: isInRecordingMode,
    contentType,
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
    onError: (msg) => message.error(msg),
    onWarning: (msg) => message.warning(msg),
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

  /**
   * 应用预设配置
   */
  const handleApplyPreset = useCallback(async (preset: ConfigPreset) => {
    try {
      // 批量保存所有配置到 storage
      await storage.setAllConfig(preset.config)

      message.success('预设配置已应用')
    } catch (error) {
      console.error('应用预设配置失败:', error)
      message.error('应用预设配置失败')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    addTagModalVisible,
    currentFavoriteForTag,
    applyConfirmModalVisible,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleConfirmApply,
    handleCancelApply,
    handleDeleteFavorite,
    handlePinFavorite,
    handleOpenAddTag,
    handleAddTag,
    handleRemoveTag,
    closeAddTagModal,
    handleEditFavorite,
    handleSaveEdit,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closeEditModal,
  } = useFavoritesManagement({
    editorValue,
    isModified,
    onApplyFavorite: handleApplyFavoriteContent,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
    onSuccess: (msg) => message.success(msg, 1.5),
  })

  /** 加载收藏数量和上限 */
  const loadFavoriteLimits = useCallback(async () => {
    try {
      const favorites = await storage.getFavorites()
      const max = await storage.getMaxFavoritesCount()
      setFavoriteCount(favorites.length)
      setMaxFavoriteCount(max)
    } catch (error) {
      console.error('加载收藏上限失败:', error)
    }
  }, [])

  /** 包装 handleOpenAddFavorite 以检查上限 */
  const handleOpenAddFavoriteWithCheck = useCallback(async () => {
    await loadFavoriteLimits()
    if (favoriteCount >= maxFavoriteCount) {
      message.error(
        `已达到收藏数量上限（${favoriteCount}/${maxFavoriteCount}），请删除旧收藏后再添加`
      )
      return
    }
    handleOpenAddFavorite()
  }, [favoriteCount, maxFavoriteCount, handleOpenAddFavorite, loadFavoriteLimits])

  /** 包装 handleAddFavorite 以在添加后刷新数量 */
  const handleAddFavoriteWithRefresh = useCallback(async () => {
    await handleAddFavorite()
    await loadFavoriteLimits()
  }, [handleAddFavorite, loadFavoriteLimits])

  /** 包装 handleDeleteFavorite 以在删除后刷新数量 */
  const handleDeleteFavoriteWithRefresh = useCallback(
    async (id: string) => {
      await handleDeleteFavorite(id)
      await loadFavoriteLimits()
    },
    [handleDeleteFavorite, loadFavoriteLimits]
  )

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
        loadFavoriteLimits()

        // 如果是录制模式打开，自动开始录制（录制模式状态已在 useEffect 中同步设置）
        if (initialRecordingMode && recordingConfig && schemaData !== undefined) {
          startRecording()
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
      loadFavoriteLimits,
      initialRecordingMode,
      recordingConfig,
      schemaData,
      startRecording,
      stopRecording,
      clearSnapshots,
      resetFullScreenMode,
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
   * 从 storage 加载用户保存的抽屉宽度
   */
  useEffect(() => {
    storage.getDrawerWidth().then((savedWidth) => {
      const parsed = parseInt(savedWidth, 10)
      if (!isNaN(parsed) && parsed > 0) {
        setDrawerSize(parsed)
      }
    })
  }, [])

  /**
   * 处理抽屉拖拽中宽度变化
   * 在录制模式下需要减去录制面板宽度，因为 antd Drawer 返回的是完整宽度
   */
  const handleDrawerResize = (newSize: number) => {
    const adjustedSize = isInRecordingMode ? newSize - RECORDING_PANEL_WIDTH : newSize
    setDrawerSize(adjustedSize)
  }

  /**
   * 处理抽屉拖拽结束，持久化宽度
   */
  const handleDrawerResizeEnd = () => {
    storage.setDrawerWidth(`${drawerSize}px`)
  }

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

          const messageType =
            apiConfig?.messageTypes?.renderPreview ??
            DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
          await sendRequestToHost(
            messageType,
            { schema: result.data, containerId },
            apiConfig?.requestTimeout ?? 1,
            apiConfig?.sourceConfig
          ).catch((error) => {
            logger.warn('拖拽结束后预览渲染请求失败:', error)
          })
        }

        // 显示预览容器
        previewContainerManager.show()
      }
    },
    [previewConfig, editorValue, wasStringData, apiConfig]
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
   * 退出预览模式时使用过渡动画，保持布局结构直到 Drawer 动画完成
   */
  const switchFullScreenMode = useCallback(
    (newMode: FullScreenMode) => {
      // 退出预览模式时：使用过渡动画，保持布局结构，然后切换到目标模式
      if (previewEnabled && newMode !== FULL_SCREEN_MODE.PREVIEW) {
        closePreviewWithTransition(() => {
          // 立即清理预览容器内容和恢复 z-index
          cleanupPreviewContainer()
          shadowDomContainerManager.resetZIndex()
        }, newMode)
        return
      }

      // 进入预览模式时：使用打开过渡动画，预览区域从 0 扩展到目标宽度
      if (newMode === FULL_SCREEN_MODE.PREVIEW && !previewEnabled) {
        shadowDomContainerManager.setZIndex(previewConfig.zIndex.preview - 1)
        openPreviewWithTransition()
        return
      }

      // 其他模式切换：直接设置
      setFullScreenMode(newMode)
    },
    [
      previewEnabled,
      closePreviewWithTransition,
      openPreviewWithTransition,
      cleanupPreviewContainer,
      previewConfig.zIndex.preview,
      setFullScreenMode,
    ]
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

  /** 右键菜单 */
  const {
    menuVisible,
    menuPosition,
    selectionRange,
    modalVisible,
    modalContent,
    handleContextMenu,
    handleSelection,
    handleMenuSelect,
    handleModalSave,
    closeMenu,
    closeModal,
  } = useEditorContextMenu({
    editorRef,
    enabled: contextMenuConfig.enabled,
  })

  /**
   * 当前内容类型是否支持内置预览（AST 或 RawString）
   */
  const isBuiltinPreviewSupported =
    contentType === ContentType.Ast || contentType === ContentType.RawString

  /**
   * 是否使用内置预览器
   * 条件：宿主没有预览函数 + 开启了内置预览器配置 + 内容类型支持
   */
  const useBuiltinPreview =
    !hasPreviewFunction && previewConfig.enableBuiltinPreview && isBuiltinPreviewSupported

  /**
   * 是否可以使用预览功能
   * 宿主有预览函数，或者（开启了内置预览器 + 内容类型支持）
   */
  const canUsePreview =
    hasPreviewFunction || (previewConfig.enableBuiltinPreview && isBuiltinPreviewSupported)

  /**
   * 切换预览状态
   */
  const handleTogglePreview = useCallback(() => {
    if (!canUsePreview) {
      message.warning('当前内容类型不支持预览')
      return
    }

    if (previewEnabled) {
      switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    } else {
      switchFullScreenMode(FULL_SCREEN_MODE.PREVIEW)
    }
  }, [canUsePreview, previewEnabled, switchFullScreenMode])

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
   * 手动渲染预览（宿主预览器模式）
   * 预览数据与保存数据使用相同的转换逻辑，确保类型一致
   * 注意：内置预览器模式下不调用此函数，预览内容由 BuiltinPreview 组件直接渲染
   */
  const handleRenderPreview = useCallback(
    async (isAutoUpdate = false) => {
      // 内置预览器模式下不需要手动渲染
      if (useBuiltinPreview) {
        return
      }
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

        // 使用 requestAnimationFrame 确保布局稳定后再计算位置
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

        // 计算预览区域位置
        const rect = previewPlaceholderRef.current?.getBoundingClientRect()
        if (!rect) {
          // 预览区域尚未渲染或正在关闭过渡中，静默返回
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

        // 发送 schema 和 containerId 给宿主
        try {
          const messageType =
            apiConfig?.messageTypes?.renderPreview ??
            DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
          await sendRequestToHost(
            messageType,
            { schema: result.data, containerId },
            apiConfig?.requestTimeout ?? 1,
            apiConfig?.sourceConfig
          )
          logger.log('预览渲染请求已发送')
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

        // 如果是自动更新，显示轻量提示
        if (isAutoUpdate) {
          showLightNotification('预览已更新')
        }
      } catch (error: any) {
        message.error('JSON 格式错误：' + error.message)
      }
    },
    [
      useBuiltinPreview,
      previewEnabled,
      hasPreviewFunction,
      editorValue,
      wasStringData,
      apiConfig,
      showLightNotification,
    ]
  )

  /** 保存最新的 handleRenderPreview 引用，避免 effect 依赖变化 */
  const handleRenderPreviewRef = useLatest(handleRenderPreview)

  /**
   * 当预览开启时，自动渲染第一次（宿主预览器模式）
   * 延迟 350ms 等待 Drawer 宽度动画和预览区域动画完成（两者都是 300ms）
   * 内置预览器模式下不需要此 effect，预览内容实时响应
   */
  useDeferredEffect(() => handleRenderPreviewRef.current(), [previewEnabled], {
    delay: 350,
    enabled: previewEnabled && hasPreviewFunction && !useBuiltinPreview,
  })

  // TODO: resize 逻辑有问题，暂时注释掉
  // /**
  //  * 监听窗口大小变化，更新预览容器位置
  //  * 使用 requestAnimationFrame 确保布局重排完成后再计算位置
  //  */
  // useEffect(() => {
  //   if (!previewEnabled || !hasPreviewFunction) return

  //   let resizeTimer: ReturnType<typeof setTimeout> | null = null

  //   const handleWindowResize = () => {
  //     // 清除之前的定时器，防止频繁触发
  //     if (resizeTimer) {
  //       clearTimeout(resizeTimer)
  //     }

  //     // 延迟 50ms + requestAnimationFrame 确保布局稳定
  //     resizeTimer = setTimeout(() => {
  //       requestAnimationFrame(() => {
  //         if (!previewPlaceholderRef.current) return

  //         const rect = previewPlaceholderRef.current.getBoundingClientRect()
  //         const position = {
  //           left: rect.left,
  //           top: rect.top,
  //           width: rect.width,
  //           height: rect.height,
  //         }

  //         previewContainerManager.updatePosition(position)
  //       })
  //     }, 50)
  //   }

  //   window.addEventListener('resize', handleWindowResize)

  //   return () => {
  //     window.removeEventListener('resize', handleWindowResize)
  //     if (resizeTimer) {
  //       clearTimeout(resizeTimer)
  //     }
  //   }
  // }, [previewEnabled, hasPreviewFunction])

  /**
   * 自动更新预览（当开启自动更新时，宿主预览器模式）
   * 内置预览器模式下不需要此 effect，预览内容实时响应
   */
  useDeferredEffect(() => handleRenderPreviewRef.current(true), [editorValue], {
    delay: previewConfig.updateDelay,
    enabled: previewEnabled && previewConfig.autoUpdate && hasPreviewFunction && !useBuiltinPreview,
  })

  /**
   * 打开或更新预览（快捷键专用）
   * 预览关闭时：打开预览
   * 预览打开时：更新预览内容（仅宿主预览器模式需要手动更新）
   */
  const handleOpenOrUpdatePreview = useCallback(() => {
    if (!canUsePreview) {
      message.warning('当前内容类型不支持预览')
      return
    }

    if (previewEnabled) {
      // 预览已打开，内置预览器模式下不需要手动更新，宿主预览器模式下触发更新
      if (!useBuiltinPreview) {
        handleRenderPreview()
      }
    } else {
      // 预览未打开，打开预览
      switchFullScreenMode(FULL_SCREEN_MODE.PREVIEW)
    }
  }, [canUsePreview, previewEnabled, useBuiltinPreview, switchFullScreenMode, handleRenderPreview])

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
    hasPreviewFunction: canUsePreview,
  })

  /**
   * 是否为全屏模式（预览或 Diff 模式）
   * 全屏模式下禁用拖拽，使用 100vw 宽度
   */
  const isFullScreenMode = (previewEnabled && !isClosingPreview) || isDiffMode

  /** 是否为最大宽度（手动拖拽到最大或全屏模式） */
  const isMaxWidth = isFullScreenMode || drawerSize >= window.innerWidth - 10

  /**
   * 计算抽屉宽度
   * - 全屏模式：100vw
   * - 录制模式：用户宽度 + 录制面板宽度
   * - 普通模式：用户宽度（数值类型，支持 resizable）
   */
  const drawerWidth = isFullScreenMode
    ? '100vw'
    : isInRecordingMode
      ? drawerSize + RECORDING_PANEL_WIDTH
      : drawerSize

  /**
   * resizable 配置
   * - 全屏模式下禁用拖拽（不传 resizable）
   * - 非全屏模式下启用拖拽，拖拽结束时持久化
   */
  const resizableConfig = isFullScreenMode
    ? undefined
    : {
        onResize: handleDrawerResize,
        onResizeEnd: handleDrawerResizeEnd,
      }

  /**
   * 处理停止录制
   * 停止后触发内容类型检测，更新 Segment 状态
   */
  const handleStopRecording = () => {
    stopRecording()
    // 录制结束后触发内容类型检测
    const result = detectContentType(editorValue)
    updateContentType(result)
  }

  /**
   * 处理进入Diff模式
   */
  const handleEnterDiffMode = useCallback(() => {
    switchFullScreenMode(FULL_SCREEN_MODE.DIFF)
  }, [switchFullScreenMode])

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
            hasPreviewFunction={canUsePreview}
            previewEnabled={previewEnabled}
            isPreviewTransitioning={isClosingPreview || isOpeningTransition}
            onTogglePreview={handleTogglePreview}
            hasDraft={hasDraft}
            onLoadDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            onOpenAddFavorite={handleOpenAddFavoriteWithCheck}
            onOpenFavorites={handleOpenFavorites}
            favoriteCount={favoriteCount}
            maxFavoriteCount={maxFavoriteCount}
            onApplyPreset={handleApplyPreset}
            themeColor={themeColor}
            editorTheme={editorTheme}
            onEditorThemeChange={setEditorTheme}
          />
        }
        placement="right"
        width={drawerWidth}
        resizable={resizableConfig}
        mask={!previewEnabled}
        onClose={handleClose}
        open={open}
        afterOpenChange={handleAfterOpenChange}
        destroyOnHidden={false}
        closable={true}
        closeIcon={<CloseIcon />}
        push={false}
        getContainer={getPortalContainer}
        styles={{
          wrapper: { zIndex: 1000 },
          mask: { zIndex: 1000 },
          section: {
            borderRadius: isMaxWidth ? '0px' : '12px 0px 0px 12px',
            transition: 'border-radius 0.3s ease',
          },
          body: { padding: 0 },
          header: { position: 'relative', borderBottom: 'none' },
          footer: { borderTop: 'none', padding: '16px 24px' },
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
            themeColor={themeColors.primaryColor}
            hoverColor={themeColors.hoverColor}
            activeColor={themeColors.activeColor}
          />
        }
      >
        <DrawerContent
          isDiffMode={isDiffMode}
          isInRecordingMode={isInRecordingMode}
          previewEnabled={previewEnabled}
          isClosingPreview={isClosingPreview}
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
              // 内置预览器模式下不需要手动更新预览
              onRenderPreview: useBuiltinPreview ? undefined : handleRenderPreview,
              onLocateError: handleLocateError,
              onRepairJson: handleRepairJson,
              onEnterDiffMode: handleEnterDiffMode,
              onExitDiffMode: handleBackToEditor,
              onCopyParam: () => showLightNotification('复制成功'),
            },
            editorProps: {
              editorRef,
              editorValue,
              editorTheme,
              enableAstTypeHints,
              contentType,
              onChange: handleEditorChange,
              enableContextMenu: contextMenuConfig.enabled,
              contextMenuTriggerMode: contextMenuConfig.triggerMode,
              onContextMenuAction: handleContextMenu,
              onSelectionChange: handleSelection,
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
            onSelectSnapshot: selectSnapshot,
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
            isClosingTransition: isClosingPreview,
            isOpeningInitial: isOpeningPreview,
            isOpeningTransition,
            useBuiltinPreview,
          }}
          normalModeProps={{
            previewEnabled,
          }}
          themeColor={themeColors.primaryColor}
          hoverColor={themeColors.hoverColor}
          activeColor={themeColors.activeColor}
        />
      </Drawer>

      <Suspense fallback={null}>
        <FavoritesManager
          addFavoriteModalVisible={addFavoriteModalVisible}
          favoriteNameInput={favoriteNameInput}
          favoritesModalVisible={favoritesModalVisible}
          favoritesList={favoritesList}
          editModalVisible={editModalVisible}
          editingFavoriteId={editingFavoriteId}
          editingName={editingName}
          editingContent={editingContent}
          applyConfirmModalVisible={applyConfirmModalVisible}
          editorTheme={editorTheme}
          themeColor={config.themeColor}
          onAddFavoriteInputChange={setFavoriteNameInput}
          onAddFavorite={handleAddFavoriteWithRefresh}
          onCloseAddFavoriteModal={closeAddFavoriteModal}
          onCloseFavoritesModal={closeFavoritesModal}
          onEditFavorite={handleEditFavorite}
          onApplyFavorite={handleApplyFavorite}
          onConfirmApply={handleConfirmApply}
          onCancelApply={handleCancelApply}
          onDeleteFavorite={handleDeleteFavoriteWithRefresh}
          onPinFavorite={handlePinFavorite}
          onAddTag={handleOpenAddTag}
          onRemoveTag={handleRemoveTag}
          onSaveEdit={handleSaveEdit}
          onCloseEditModal={closeEditModal}
        />

        <AddTagModal
          visible={addTagModalVisible}
          existingTags={currentFavoriteForTag?.tags}
          themeColor={config.themeColor}
          onAdd={handleAddTag}
          onClose={closeAddTagModal}
        />
      </Suspense>

      {contextMenuConfig.enabled && (
        <Suspense fallback={null}>
          <EditorContextMenu
            visible={menuVisible}
            position={menuPosition}
            config={contextMenuConfig}
            hasSelection={!!selectionRange?.text}
            themeColor={themeColor}
            editorTheme={editorTheme}
            onSelect={handleMenuSelect}
            onClose={closeMenu}
          />

          <QuickEditModal
            visible={modalVisible}
            content={modalContent}
            editorTheme={editorTheme}
            themeColor={themeColor}
            onSave={handleModalSave}
            onClose={closeModal}
          />
        </Suspense>
      )}
    </>
  )
}
