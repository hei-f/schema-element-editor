import type { CodeMirrorEditorHandle } from '@/features/schema-drawer/components/editor/CodeMirrorEditor'
import { CodeMirrorEditor } from '@/features/schema-drawer/components/editor/CodeMirrorEditor'
import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { EditorTheme } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Button, Modal } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  EditModalContent,
  EditModalNameInput,
  EditorContainer,
  ErrorAlert,
  FullWidthVerticalSpace,
  ThemedPrimaryButton,
} from '../styles/modals.styles'

interface FavoriteEditModalProps {
  visible: boolean
  favoriteId: string | null
  initialName: string
  initialContent: string
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 主题色 */
  themeColor: string
  /** 悬浮态颜色 */
  hoverColor: string
  /** 激活态颜色 */
  activeColor: string
  onSave: (id: string, name: string, content: string) => Promise<void>
  onClose: () => void
}

/**
 * 收藏编辑模态框组件
 */
export const FavoriteEditModal: React.FC<FavoriteEditModalProps> = (props) => {
  const {
    visible,
    favoriteId,
    initialName,
    initialContent,
    editorTheme,
    themeColor,
    hoverColor,
    activeColor,
    onSave,
    onClose,
  } = props
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<CodeMirrorEditorHandle>(null)

  /**
   * 初始化编辑状态
   */
  useEffect(() => {
    if (visible && favoriteId) {
      setName(initialName)
      setContent(initialContent)
      setNameError(null)
      setJsonError(null)
      // 使用 ref 设置编辑器内容
      if (editorRef.current) {
        editorRef.current.setValue(initialContent)
      }
    }
  }, [visible, favoriteId, initialName, initialContent])

  /**
   * 检查是否有未保存的更改
   */
  const hasUnsavedChanges = useCallback(() => {
    return name !== initialName || content !== initialContent
  }, [name, content, initialName, initialContent])

  /**
   * 验证名称
   */
  const validateName = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setNameError('名称不能为空')
      return false
    }
    if (value.length > 50) {
      setNameError('名称不能超过50个字符')
      return false
    }
    setNameError(null)
    return true
  }, [])

  /**
   * 验证 JSON 格式（防抖）
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!content.trim()) {
        setJsonError('内容不能为空')
        return
      }

      try {
        JSON.parse(content)
        setJsonError(null)
      } catch (error: any) {
        setJsonError(`JSON 格式错误: ${error.message}`)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [content])

  /**
   * 处理名称变化
   */
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setName(value)
      validateName(value)
    },
    [validateName]
  )

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
    }
  }, [])

  /**
   * 处理保存
   */
  const handleSave = useCallback(async () => {
    if (!favoriteId) return

    // 最终验证
    const nameValid = validateName(name)
    if (!nameValid) {
      return
    }

    if (!content.trim()) {
      setJsonError('内容不能为空')
      return
    }

    try {
      JSON.parse(content)
    } catch (error: any) {
      setJsonError(`JSON 格式错误: ${error.message}`)
      return
    }

    setIsSaving(true)
    try {
      await onSave(favoriteId, name.trim(), content)
      onClose()
    } catch (error) {
      // 错误由父组件处理，但仍需打印以便调试
      console.error('保存收藏失败:', error)
    } finally {
      setIsSaving(false)
    }
  }, [favoriteId, name, content, validateName, onSave, onClose])

  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      Modal.confirm({
        title: '确认关闭',
        content: '有未保存的修改，确定要关闭吗？',
        okText: '确定',
        cancelText: '取消',
        getContainer: shadowRootManager.getContainer,
        zIndex: MODAL_Z_INDEX,
        onOk: () => {
          onClose()
        },
      })
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, onClose])

  /**
   * 保存按钮是否禁用
   */
  const isSaveDisabled = !!nameError || !!jsonError || !hasUnsavedChanges() || isSaving

  return (
    <Modal
      title={`编辑收藏 - ${initialName}`}
      open={visible}
      onCancel={handleClose}
      width={900}
      getContainer={shadowRootManager.getContainer}
      zIndex={MODAL_Z_INDEX}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isSaving}>
          取消
        </Button>,
        <ThemedPrimaryButton
          key="save"
          type="primary"
          onClick={handleSave}
          disabled={isSaveDisabled}
          loading={isSaving}
          $themeColor={themeColor}
          $hoverColor={hoverColor}
          $activeColor={activeColor}
        >
          保存
        </ThemedPrimaryButton>,
      ]}
      styles={{
        body: { padding: '16px' },
      }}
    >
      <EditModalContent>
        <FullWidthVerticalSpace>
          {/* 名称输入框 */}
          <div>
            <EditModalNameInput
              placeholder="收藏名称"
              value={name}
              onChange={handleNameChange}
              status={nameError ? 'error' : undefined}
              maxLength={50}
              showCount
            />
            {nameError && <ErrorAlert message={nameError} type="error" showIcon />}
          </div>

          {/* JSON 编辑器 */}
          <div>
            <EditorContainer>
              <CodeMirrorEditor
                ref={editorRef}
                height="500px"
                defaultValue={initialContent}
                onChange={handleContentChange}
                theme={editorTheme}
                placeholder="在此输入 JSON 内容..."
              />
            </EditorContainer>
            {jsonError && <ErrorAlert message={jsonError} type="error" showIcon />}
          </div>
        </FullWidthVerticalSpace>
      </EditModalContent>
    </Modal>
  )
}
