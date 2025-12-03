import { EDITOR_THEME_OPTIONS } from '@/shared/constants/editor-themes'
import type { EditorTheme, HistoryEntry, ToolbarButtonsConfig } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import {
  BgColorsOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Space, Tooltip, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'
import React from 'react'
import { HistoryDropdown } from '../toolbar/HistoryDropdown'
import {
  DraftAutoSaveSuccess,
  DraftNotification,
  DrawerTitleActions,
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
  /** 当前编辑器主题 */
  editorTheme: EditorTheme
  /** 设置编辑器主题 */
  onEditorThemeChange: (theme: EditorTheme) => void
}

/**
 * Schema 编辑器抽屉标题组件
 * 包含草稿状态、导入导出、历史、预览、收藏、主题切换等功能按钮
 */
export const DrawerTitle: React.FC<DrawerTitleProps> = (props) => {
  const {
    toolbarButtons,
    draftAutoSaveStatus,
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
    onTogglePreview,
    hasDraft,
    onLoadDraft,
    onDeleteDraft,
    onOpenAddFavorite,
    onOpenFavorites,
    editorTheme,
    onEditorThemeChange,
  } = props

  return (
    <DrawerTitleContainer>
      <DrawerTitleLeft>
        <span>Schema Editor</span>
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
                  <Button icon={<UploadOutlined />} size="small" type="text" />
                </Tooltip>
              </Upload>
              <Tooltip title="导出">
                <Button
                  icon={<DownloadOutlined />}
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
            />
          )}

          {toolbarButtons.preview && (
            <Tooltip
              title={
                !hasPreviewFunction
                  ? '页面未提供预览函数'
                  : previewEnabled
                    ? '关闭预览'
                    : '开启预览'
              }
            >
              <Button
                size="small"
                type={previewEnabled ? 'primary' : 'text'}
                icon={previewEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={onTogglePreview}
                disabled={!hasPreviewFunction}
              />
            </Tooltip>
          )}

          {toolbarButtons.draft && hasDraft && (
            <>
              <Tooltip title="加载草稿">
                <Button
                  size="small"
                  type="text"
                  icon={<FileTextOutlined />}
                  onClick={onLoadDraft}
                />
              </Tooltip>
              <Tooltip title="删除草稿">
                <Button
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
              <Tooltip title="添加收藏">
                <Button
                  size="small"
                  type="text"
                  icon={<StarOutlined />}
                  onClick={onOpenAddFavorite}
                />
              </Tooltip>
              <Tooltip title="浏览收藏">
                <Button
                  size="small"
                  type="text"
                  icon={<FolderOpenOutlined />}
                  onClick={onOpenFavorites}
                />
              </Tooltip>
            </>
          )}

          <Dropdown
            menu={{
              items: EDITOR_THEME_OPTIONS.map((t) => ({
                key: t.value,
                label: t.label,
                onClick: () => {
                  onEditorThemeChange(t.value)
                  storage.setEditorTheme(t.value)
                },
              })),
              selectedKeys: [editorTheme],
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
  )
}
