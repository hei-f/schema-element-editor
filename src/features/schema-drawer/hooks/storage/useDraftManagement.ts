import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Modal } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseDraftManagementProps {
  paramsKey: string
  editorValue: string
  isModified: boolean
  autoSaveDraft: boolean
  isFirstLoad: boolean
  /** 是否启用草稿功能（false 时所有草稿逻辑跳过） */
  enabled?: boolean
  onLoadDraft: (content: string) => void
  /** 成功提示回调 */
  onSuccess?: (message: string) => void
  /** 警告提示回调 */
  onWarning?: (message: string) => void
  /** 错误提示回调 */
  onError?: (message: string) => void
}

interface UseDraftManagementReturn {
  hasDraft: boolean
  showDraftNotification: boolean
  draftAutoSaveStatus: 'idle' | 'saving' | 'success'
  checkDraft: () => Promise<void>
  handleSaveDraft: () => Promise<void>
  handleLoadDraft: () => Promise<void>
  handleDeleteDraft: () => void
  debouncedAutoSaveDraft: (value: string) => void
}

/**
 * 草稿管理 Hook
 */
export const useDraftManagement = ({
  paramsKey,
  editorValue,
  isModified,
  autoSaveDraft,
  isFirstLoad,
  enabled = true,
  onLoadDraft,
  onSuccess,
  onWarning,
  onError,
}: UseDraftManagementProps): UseDraftManagementReturn => {
  const [hasDraft, setHasDraft] = useState(false)
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const [draftAutoSaveStatus, setDraftAutoSaveStatus] = useState<'idle' | 'saving' | 'success'>(
    'idle'
  )

  const draftAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const draftNotificationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveDebounce = 3000

  /**
   * 检查是否有草稿
   */
  const checkDraft = useCallback(async () => {
    // 功能禁用时跳过检查
    if (!enabled) {
      setHasDraft(false)
      setShowDraftNotification(false)
      return
    }

    try {
      const draft = await storage.getDraft(paramsKey)
      if (draft) {
        setHasDraft(true)
        setShowDraftNotification(true)
      } else {
        setHasDraft(false)
        setShowDraftNotification(false)
      }
    } catch (error) {
      logger.error('检查草稿失败:', error)
    }
  }, [paramsKey, enabled])

  /**
   * 手动保存草稿
   */
  const handleSaveDraft = useCallback(async () => {
    // 功能禁用时跳过
    if (!enabled) {
      return
    }

    try {
      await storage.saveDraft(paramsKey, editorValue)
      setHasDraft(true)
      setShowDraftNotification(true)
      onSuccess?.('草稿已保存')
    } catch (error) {
      console.error('保存草稿失败:', error)
      onError?.('保存草稿失败')
    }
  }, [paramsKey, editorValue, enabled, onSuccess, onError])

  /**
   * 加载草稿内容
   */
  const loadDraftContent = useCallback(async () => {
    try {
      const draft = await storage.getDraft(paramsKey)
      if (draft) {
        onLoadDraft(draft.content)
        onSuccess?.('草稿已加载')
      } else {
        onWarning?.('未找到草稿')
        setHasDraft(false)
      }
    } catch (error) {
      console.error('加载草稿失败:', error)
      onError?.('加载草稿失败')
    }
  }, [paramsKey, onLoadDraft, onSuccess, onWarning, onError])

  /**
   * 加载草稿（带确认）
   */
  const handleLoadDraft = useCallback(async () => {
    if (isModified) {
      Modal.confirm({
        title: '确认加载草稿',
        content: '当前内容未保存，是否加载草稿？',
        okText: '加载',
        cancelText: '取消',
        getContainer: shadowRootManager.getContainer,
        zIndex: MODAL_Z_INDEX,
        onOk: async () => {
          await loadDraftContent()
        },
      })
    } else {
      await loadDraftContent()
    }
  }, [isModified, loadDraftContent])

  /**
   * 删除草稿
   */
  const handleDeleteDraft = useCallback(() => {
    Modal.confirm({
      title: '确认删除草稿',
      content: '删除后将无法恢复，确认删除吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      getContainer: shadowRootManager.getContainer,
      zIndex: MODAL_Z_INDEX,
      onOk: async () => {
        try {
          await storage.deleteDraft(paramsKey)
          setHasDraft(false)
          setShowDraftNotification(false)
          onSuccess?.('草稿已删除')
        } catch (error) {
          console.error('删除草稿失败:', error)
          onError?.('删除草稿失败')
        }
      },
    })
  }, [paramsKey, onSuccess, onError])

  /**
   * 草稿自动保存（防抖）
   * 只有在启用自动保存且不是首次加载时才执行
   */
  const debouncedAutoSaveDraft = useCallback(
    (value: string) => {
      // 功能禁用时跳过
      if (!enabled) {
        return
      }

      // 如果未启用自动保存或是首次加载，则不执行
      if (!autoSaveDraft || isFirstLoad) {
        return
      }

      if (draftAutoSaveTimerRef.current) {
        clearTimeout(draftAutoSaveTimerRef.current)
      }

      setDraftAutoSaveStatus('saving')

      draftAutoSaveTimerRef.current = setTimeout(async () => {
        try {
          await storage.saveDraft(paramsKey, value)
          setHasDraft(true)
          setDraftAutoSaveStatus('success')

          setTimeout(() => {
            setDraftAutoSaveStatus('idle')
          }, 2000)
        } catch (error) {
          logger.error('自动保存草稿失败:', error)
          setDraftAutoSaveStatus('idle')
        }
      }, autoSaveDebounce)
    },
    [paramsKey, autoSaveDraft, isFirstLoad, enabled]
  )

  /**
   * 监听showDraftNotification变化，显示3秒后自动消失
   */
  useEffect(() => {
    if (showDraftNotification) {
      if (draftNotificationTimerRef.current) {
        clearTimeout(draftNotificationTimerRef.current)
      }

      draftNotificationTimerRef.current = setTimeout(() => {
        setShowDraftNotification(false)
      }, 3000)
    }

    return () => {
      if (draftNotificationTimerRef.current) {
        clearTimeout(draftNotificationTimerRef.current)
      }
    }
  }, [showDraftNotification])

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (draftAutoSaveTimerRef.current) {
        clearTimeout(draftAutoSaveTimerRef.current)
      }
    }
  }, [])

  return {
    hasDraft,
    showDraftNotification,
    draftAutoSaveStatus,
    checkDraft,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    debouncedAutoSaveDraft,
  }
}
