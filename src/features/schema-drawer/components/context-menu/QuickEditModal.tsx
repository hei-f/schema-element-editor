import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { App, ConfigProvider, Modal, Space } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { ContentType, type EditorTheme, type SchemaSnapshot } from '@/shared/types'
import { TOOLBAR_MODE } from '@/shared/constants/ui-modes'
import { schemaTransformer } from '../../services/schema-transformer'
import { CodeMirrorEditor, type CodeMirrorEditorHandle } from '../editor/CodeMirrorEditor'
import { DrawerToolbar } from '../toolbar/DrawerToolbar'
import { SchemaDiffView } from '../editor/SchemaDiffView'
import { getEditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { useLightNotifications } from '../../hooks/ui/useLightNotifications'
import { useJsonRepair } from '../../hooks/editor/useJsonRepair'
import { LightSuccessNotification } from '../../styles/notifications/notifications.styles'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'
import type { QuickEditModalProps } from './types'

/**
 * 弹窗内编辑器容器
 */
const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
`

/**
 * 弹窗内容容器
 * 使用 gap 实现子元素间隔，符合项目布局规范
 */
const ModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 500px;
`

/**
 * Diff容器包装
 * 使用 flex: 1 填充剩余空间，覆盖 FullScreenModeWrapper 的 height: 100%
 */
const DiffContainerWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

/**
 * 模式切换容器
 * 用于包裹多个 ModeContentWrapper，限制绝对定位元素不溢出
 */
const ModeSwitchContainer = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

/**
 * 模式内容包装器
 * 通过绝对定位和 visibility 控制显示/隐藏，避免组件重建
 */
const ModeContentWrapper = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${(props) => (props.$active ? 2 : 1)};
  /* 非活跃的立即隐藏，不参与过渡 */
  visibility: ${(props) => (props.$active ? 'visible' : 'hidden')};
  /* 活跃的始终不透明，只用 transform 动画增加动感 */
  opacity: 1;
  transform: translateY(${(props) => (props.$active ? '0' : '12px')});
  /* 只有激活时才有过渡动画（从偏移位置滑入） */
  transition: ${(props) => (props.$active ? 'transform 180ms ease-out' : 'none')};
  pointer-events: ${(props) => (props.$active ? 'auto' : 'none')};
`

/**
 * 带过渡动画的Modal
 * 给Modal的内容容器添加width过渡动画
 */
const AnimatedModal = styled(Modal)`
  &.see-modal {
    transition: width 0.3s ease;
  }
`

/**
 * 快速编辑弹窗组件
 * 用于在独立的编辑器中对选中内容执行定位错误或JSON修复操作
 */
export const QuickEditModal: React.FC<QuickEditModalProps> = (props) => {
  const { visible, content, editorTheme, themeColor, onSave, onClose } = props

  const { message } = App.useApp()
  const { lightNotifications, showLightNotification } = useLightNotifications()
  const editorRef = useRef<CodeMirrorEditorHandle | null>(null)
  const [editorValue, setEditorValue] = useState<string>(content)
  const [contentType, setContentType] = useState<ContentType>(ContentType.Other)

  /** Diff 模式状态 */
  const [diffMode, setDiffMode] = useState<boolean>(false)

  /**
   * 使用 JSON 修复 Hook
   * 现在 hook 内部使用 ref 保持最新引用，不需要使用者缓存传入的函数
   */
  const {
    repairOriginalValue,
    pendingRepairedValue,
    handleLocateError,
    handleRepairJson,
    handleApplyRepair: handleApplyRepairOriginal,
    handleCancelRepair: handleCancelRepairOriginal,
  } = useJsonRepair({
    editorValue,
    editorRef,
    getContentToAnalyze: (value: string) => {
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
    updateEditorContent: (newContent: string) => {
      editorRef.current?.setValue(newContent)
      setEditorValue(newContent)
    },
    switchFullScreenMode: () => setDiffMode(true),
    showLightNotification,
    showError: (msg: string) => message.error(msg),
    showWarning: (msg: string) => message.warning(msg),
  })

  /**
   * 包装应用修复函数（额外处理 diff 模式）
   */
  const handleApplyRepair = () => {
    handleApplyRepairOriginal()
    setDiffMode(false)
  }

  /**
   * 包装取消修复函数（额外处理 diff 模式）
   */
  const handleCancelRepair = () => {
    handleCancelRepairOriginal()
    setDiffMode(false)
  }

  /**
   * 检测内容类型
   */
  const detectContentType = useCallback((value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        setContentType(ContentType.Ast)
      } else if (typeof parsed === 'string') {
        setContentType(ContentType.RawString)
      } else {
        setContentType(ContentType.Other)
      }
    } catch {
      setContentType(ContentType.Other)
    }
  }, [])

  /**
   * 弹窗打开时更新编辑器内容
   */
  React.useEffect(() => {
    if (visible && content) {
      setEditorValue(content)
      detectContentType(content)
      // useEffect 已确保 DOM 更新完成,ref 已赋值,可直接设置编辑器内容
      editorRef.current?.setValue(content)
    }
  }, [visible, content, detectContentType])

  /**
   * Diff 快照数据（派生状态）
   * 使用 useMemo 确保在 diffMode 变化时立即计算，
   * 配合 useDiffSync 的优化，确保 SchemaDiffView 首次渲染就能立即计算 diff
   */
  const diffSnapshots = useMemo<SchemaSnapshot[]>(() => {
    if (diffMode && pendingRepairedValue) {
      return [
        {
          id: 1,
          content: repairOriginalValue,
          timestamp: 0,
        },
        {
          id: 2,
          content: pendingRepairedValue,
          timestamp: 1,
        },
      ]
    }
    return []
  }, [diffMode, repairOriginalValue, pendingRepairedValue])

  /**
   * 检查是否可以解析
   */
  const canParse = useMemo(() => {
    try {
      const parsed = JSON.parse(editorValue)
      return typeof parsed === 'string'
    } catch {
      return false
    }
  }, [editorValue])

  /**
   * 计算主题色和编辑器主题变量
   */
  const { modalTheme, primaryColor, hoverColor, activeColor, editorThemeVars } = useMemo(() => {
    const colors = generate(themeColor)
    const primaryColor = colors[5]
    const hoverColor = colors[4]
    const activeColor = colors[6]

    return {
      primaryColor,
      hoverColor,
      activeColor,
      editorThemeVars: getEditorThemeVars(editorTheme),
      modalTheme: {
        cssVar: { prefix: 'see' },
        token: {
          colorPrimary: primaryColor,
          colorPrimaryHover: hoverColor,
          colorPrimaryActive: activeColor,
          colorInfo: primaryColor,
          colorLink: primaryColor,
          colorLinkHover: hoverColor,
          colorLinkActive: activeColor,
        },
      },
    }
  }, [themeColor, editorTheme])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value)
      detectContentType(value)
    },
    [detectContentType]
  )

  /**
   * 格式化
   */
  const handleFormat = useCallback(() => {
    const result = schemaTransformer.formatJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      showLightNotification('格式化成功')
    } else {
      message.error(`格式化失败: ${result.error}`)
    }
  }, [editorValue, showLightNotification, message])

  /**
   * 转义
   */
  const handleEscape = useCallback(() => {
    const result = schemaTransformer.escapeJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      showLightNotification('转义成功')
    } else {
      message.error(result.error || '转义失败')
    }
  }, [editorValue, showLightNotification, message])

  /**
   * 去转义
   */
  const handleUnescape = useCallback(() => {
    const result = schemaTransformer.unescapeJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      showLightNotification('去转义成功')
    } else {
      message.error(result.error || '去转义失败')
    }
  }, [editorValue, showLightNotification, message])

  /**
   * 压缩
   */
  const handleCompact = useCallback(() => {
    const result = schemaTransformer.compactJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      showLightNotification('压缩成功')
    } else {
      message.error(result.error || '压缩失败')
    }
  }, [editorValue, showLightNotification, message])

  /**
   * 解析
   */
  const handleParse = useCallback(() => {
    const result = schemaTransformer.parseNestedJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      showLightNotification(
        `解析成功${result.parseCount ? `（解析了 ${result.parseCount} 层）` : ''}`
      )
    } else {
      message.error(result.error || '解析失败')
    }
  }, [editorValue, showLightNotification, message])

  /**
   * Segment 切换
   */
  const handleSegmentChange = useCallback((_value: string | number) => {
    // 不需要实现，快速编辑模式下不需要切换
  }, [])

  /**
   * 保存并关闭
   */
  const handleSave = useCallback(() => {
    const currentValue = editorRef.current?.getValue() || editorValue
    onSave(currentValue)
  }, [editorValue, onSave])

  /**
   * 获取 Portal 容器
   */
  const getPortalContainer = useCallback(() => {
    return shadowRootManager.getContainer()
  }, [])

  return (
    <ConfigProvider theme={modalTheme} getPopupContainer={getPortalContainer}>
      <App>
        <AnimatedModal
          title="单独编辑"
          open={visible}
          onCancel={onClose}
          width={diffMode ? 'calc(100vw - 80px)' : 'min(900px, calc(100vw - 200px))'}
          getContainer={getPortalContainer}
          styles={{
            container: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
            },
            header: { margin: 0, padding: 0 },
            body: { margin: 0, padding: 0 },
            footer: { margin: 0, padding: 0 },
          }}
          footer={
            diffMode ? (
              <Space>
                <ModalFooterButton onClick={onClose}>关闭</ModalFooterButton>
              </Space>
            ) : (
              <Space>
                <ModalFooterButton onClick={onClose}>取消</ModalFooterButton>
                <ModalFooterButton
                  type="primary"
                  onClick={handleSave}
                  $themeColor={primaryColor}
                  $hoverColor={hoverColor}
                  $activeColor={activeColor}
                >
                  保存并替换
                </ModalFooterButton>
              </Space>
            )
          }
        >
          <ModalContentContainer>
            <DrawerToolbar
              mode={diffMode ? TOOLBAR_MODE.DIFF : TOOLBAR_MODE.NORMAL}
              attributes={{ params: [] }}
              contentType={contentType}
              canParse={canParse}
              toolbarButtons={{
                astRawStringToggle: false,
                escape: true,
                deserialize: true,
                serialize: true,
                format: true,
                preview: false,
                importExport: false,
                draft: false,
                favorites: false,
                history: false,
              }}
              onFormat={handleFormat}
              onEscape={handleEscape}
              onUnescape={handleUnescape}
              onCompact={handleCompact}
              onParse={handleParse}
              onSegmentChange={handleSegmentChange}
              onLocateError={handleLocateError}
              onRepairJson={handleRepairJson}
              hasPendingRepair={!!pendingRepairedValue}
              onApplyRepair={handleApplyRepair}
              onCancelRepair={handleCancelRepair}
              themeColor={primaryColor}
              hoverColor={hoverColor}
              activeColor={activeColor}
            />

            <ModeSwitchContainer>
              {/* 编辑器内容 - 非 Diff 时显示 */}
              <ModeContentWrapper $active={!diffMode}>
                <EditorContainer>
                  {lightNotifications.map((notification, index) => {
                    const isDark = editorTheme === 'dark' || editorTheme === 'seeDark'
                    return (
                      <LightSuccessNotification
                        key={notification.id}
                        style={{ top: `${16 + index * 48}px` }}
                        $isDark={isDark}
                      >
                        {notification.text}
                      </LightSuccessNotification>
                    )
                  })}
                  <CodeMirrorEditor
                    ref={editorRef}
                    defaultValue={content}
                    onChange={handleEditorChange}
                    theme={editorTheme as EditorTheme}
                    height="100%"
                    placeholder="在此编辑 JSON..."
                  />
                </EditorContainer>
              </ModeContentWrapper>

              {/* Diff 内容 - Diff 时显示 */}
              <ModeContentWrapper $active={diffMode}>
                <DiffContainerWrapper>
                  <ThemeProvider theme={editorThemeVars}>
                    <SchemaDiffView
                      snapshots={diffSnapshots}
                      transformedLeftContent={repairOriginalValue}
                      transformedRightContent={pendingRepairedValue}
                      theme={editorTheme as EditorTheme}
                    />
                  </ThemeProvider>
                </DiffContainerWrapper>
              </ModeContentWrapper>
            </ModeSwitchContainer>
          </ModalContentContainer>
        </AnimatedModal>
      </App>
    </ConfigProvider>
  )
}
