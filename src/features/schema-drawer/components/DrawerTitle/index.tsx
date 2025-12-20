import { ExportIcon } from '@/shared/icons/drawer/title/ExportIcon'
import { FolderIcon } from '@/shared/icons/drawer/title/FolderIcon'
import { ImportIcon } from '@/shared/icons/drawer/title/ImportIcon'
import { PreviewOffIcon } from '@/shared/icons/drawer/title/PreviewOffIcon'
import { PreviewOnIcon } from '@/shared/icons/drawer/title/PreviewOnIcon'
import { StarIcon } from '@/shared/icons/drawer/title/StarIcon'
import type { ConfigPreset, EditorTheme, HistoryEntry, ToolbarButtonsConfig } from '@/shared/types'
import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons'
import { generate } from '@ant-design/colors'
import { Space, Tooltip, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'
import React, { useMemo } from 'react'
import { HistoryDropdown } from '../toolbar/HistoryDropdown'
import { ThemeDropdown } from '../toolbar/ThemeDropdown'
import { PresetsDropdown } from '../toolbar/PresetsDropdown'
import {
  DraftAutoSaveSuccess,
  DraftNotification,
  DrawerTitleActions,
  DrawerTitleButton,
  DrawerTitleContainer,
  DrawerTitleLeft,
} from './styles'

interface DrawerTitleProps {
  /** 工具栏按钮配置 */
  toolbarButtons: ToolbarButtonsConfig
  /** 草稿自动保存状态 */
  draftAutoSaveStatus: 'idle' | 'saving' | 'success'
  /** 是否显示草稿检测通知 */
  showDraftNotification: boolean
  /** 导入处理函数 */
  onImport: (file: RcFile) => boolean
  /** 是否可以解析（用于禁用导出按钮） */
  canParse: boolean
  /** 导出处理函数 */
  onExport: () => void
  /** 历史记录列表 */
  history: HistoryEntry[]
  /** 当前历史索引 */
  currentIndex: number
  /** 加载历史版本 */
  onLoadVersion: (index: number) => void
  /** 清除历史 */
  onClearHistory: () => void
  /** 是否有历史记录 */
  hasHistory: boolean
  /** 宿主环境是否存在预览函数 */
  hasPreviewFunction: boolean
  /** 预览是否开启 */
  previewEnabled: boolean
  /** 预览是否正在过渡中（打开或关闭动画进行中） */
  isPreviewTransitioning: boolean
  /** 切换预览 */
  onTogglePreview: () => void
  /** 是否有草稿 */
  hasDraft: boolean
  /** 加载草稿 */
  onLoadDraft: () => void
  /** 删除草稿 */
  onDeleteDraft: () => void
  /** 打开添加收藏 */
  onOpenAddFavorite: () => void
  /** 打开收藏列表 */
  onOpenFavorites: () => void
  /** 应用预设配置 */
  onApplyPreset: (preset: ConfigPreset) => Promise<void>
  /** 当前编辑器主题 */
  editorTheme: EditorTheme
  /** 设置编辑器主题 */
  onEditorThemeChange: (theme: EditorTheme) => void
  /** 主题色 */
  themeColor?: string
}

/**
 * Schema 编辑器抽屉标题组件
 * 包含草稿状态、导入导出、历史、预览、收藏、主题切换等功能按钮
 */
export const DrawerTitle: React.FC<DrawerTitleProps> = (props) => {
  const {
    toolbarButtons,
    draftAutoSaveStatus,
    themeColor = '#0066ff',
    showDraftNotification,
    onImport,
    canParse,
    onExport,
    history,
    currentIndex,
    onLoadVersion,
    onClearHistory,
    hasHistory,
    hasPreviewFunction,
    previewEnabled,
    isPreviewTransitioning,
    onTogglePreview,
    hasDraft,
    onLoadDraft,
    onDeleteDraft,
    onOpenAddFavorite,
    onOpenFavorites,
    onApplyPreset,
    editorTheme,
    onEditorThemeChange,
  } = props

  /** 计算主题色梯度 */
  const themeColors = useMemo(() => {
    const colors = generate(themeColor)
    return {
      primaryColor: colors[5],
      hoverColor: colors[4],
      activeColor: colors[6],
    }
  }, [themeColor])

  return (
    <DrawerTitleContainer>
      <DrawerTitleLeft>
        <span>Schema Element Editor</span>
        {toolbarButtons.draft && draftAutoSaveStatus === 'success' && (
          <DraftAutoSaveSuccess>✓ 草稿已自动保存</DraftAutoSaveSuccess>
        )}
        {toolbarButtons.draft && showDraftNotification && (
          <DraftNotification>💾 检测到草稿</DraftNotification>
        )}
      </DrawerTitleLeft>
      <DrawerTitleActions>
        <Space size="small">
          {/* 导入导出按钮 */}
          {toolbarButtons.importExport && (
            <>
              <Upload accept=".json" showUploadList={false} beforeUpload={onImport} maxCount={1}>
                <Tooltip title="导入">
                  <DrawerTitleButton icon={<ImportIcon />} size="small" type="text" />
                </Tooltip>
              </Upload>
              <Tooltip title="导出">
                <DrawerTitleButton
                  icon={<ExportIcon />}
                  size="small"
                  type="text"
                  onClick={onExport}
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
              onLoadVersion={onLoadVersion}
              onClearHistory={onClearHistory}
              disabled={!hasHistory}
              themeColor={themeColor}
              editorTheme={editorTheme}
            />
          )}

          {toolbarButtons.preview && (
            <Tooltip
              title={!hasPreviewFunction ? '页面未提供预览函数' : previewEnabled ? '' : '开启预览'}
            >
              <DrawerTitleButton
                size="small"
                type={previewEnabled ? 'primary' : 'text'}
                icon={previewEnabled ? <PreviewOnIcon /> : <PreviewOffIcon />}
                onClick={onTogglePreview}
                disabled={!hasPreviewFunction}
                loading={isPreviewTransitioning}
                $themeColor={themeColors.primaryColor}
                $hoverColor={themeColors.hoverColor}
                $activeColor={themeColors.activeColor}
              />
            </Tooltip>
          )}

          {toolbarButtons.draft && hasDraft && (
            <>
              <Tooltip title="加载草稿">
                <DrawerTitleButton
                  size="small"
                  type="text"
                  icon={<FileTextOutlined />}
                  onClick={onLoadDraft}
                />
              </Tooltip>
              <Tooltip title="删除草稿">
                <DrawerTitleButton
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={onDeleteDraft}
                />
              </Tooltip>
            </>
          )}

          {toolbarButtons.favorites && (
            <>
              <Tooltip title={previewEnabled ? '预览模式下不可用' : '添加收藏'}>
                <DrawerTitleButton
                  size="small"
                  type="text"
                  icon={<StarIcon />}
                  onClick={onOpenAddFavorite}
                  disabled={previewEnabled}
                />
              </Tooltip>
              <Tooltip title={previewEnabled ? '预览模式下不可用' : '浏览收藏'}>
                <DrawerTitleButton
                  size="small"
                  type="text"
                  icon={<FolderIcon />}
                  onClick={onOpenFavorites}
                  disabled={previewEnabled}
                />
              </Tooltip>
            </>
          )}

          {/* 预设配置下拉 */}
          <PresetsDropdown
            onApplyPreset={onApplyPreset}
            themeColor={themeColor}
            editorTheme={editorTheme}
          />

          <ThemeDropdown
            editorTheme={editorTheme}
            onEditorThemeChange={onEditorThemeChange}
            themeColor={themeColor}
          />
        </Space>
      </DrawerTitleActions>
    </DrawerTitleContainer>
  )
}
