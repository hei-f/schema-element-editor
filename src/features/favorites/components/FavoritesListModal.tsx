import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { Favorite, FavoriteTag } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import type { TableColumnsType } from 'antd'
import { Modal, Space, Flex } from 'antd'
import { PlusOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'
import {
  ClickableFavoriteModalTag,
  FavoriteModalTag,
  FavoriteName,
  FavoritesPinButton,
  FavoritesTable,
  FullWidthSearchInput,
  ListSearchContainer,
} from '../styles/modals.styles'

interface FavoritesListModalProps {
  visible: boolean
  favoritesList: Favorite[]
  onEdit: (favorite: Favorite) => void
  onApply: (favorite: Favorite) => void
  onDelete: (id: string) => Promise<void>
  onPin: (id: string) => Promise<void>
  onAddTag: (id: string) => Promise<void>
  onRemoveTag: (id: string, tagLabel: string) => Promise<void>
  onClose: () => void
}

/**
 * 收藏列表模态框组件
 */
export const FavoritesListModal: React.FC<FavoritesListModalProps> = ({
  visible,
  favoritesList,
  onEdit,
  onApply,
  onDelete,
  onPin,
  onAddTag,
  onRemoveTag,
  onClose,
}) => {
  /** 搜索关键词状态 */
  const [searchKeyword, setSearchKeyword] = useState('')
  /** 防抖后的搜索关键词 */
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('')

  /**
   * 搜索防抖逻辑（300ms）
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchKeyword])

  /**
   * 过滤收藏列表
   * 支持搜索名称和内容
   */
  const filteredFavoritesList = useMemo(() => {
    if (!debouncedSearchKeyword.trim()) {
      return favoritesList
    }

    const keyword = debouncedSearchKeyword.toLowerCase()
    return favoritesList.filter((favorite) => {
      const nameMatch = favorite.name.toLowerCase().includes(keyword)
      const contentMatch = favorite.content.toLowerCase().includes(keyword)
      return nameMatch || contentMatch
    })
  }, [favoritesList, debouncedSearchKeyword])

  const favoritesColumns: TableColumnsType<Favorite> = [
    {
      title: '',
      key: 'pin',
      width: 50,
      render: (_: any, record: Favorite) => (
        <FavoritesPinButton
          type="text"
          size="small"
          icon={record.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          onClick={() => onPin(record.id)}
          $pinned={!!record.isPinned}
          title={record.isPinned ? '取消固定' : '固定'}
        />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (name: string, record: Favorite) => (
        <FavoriteName $pinned={record.isPinned}>{name}</FavoriteName>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      width: 220,
      render: (_: any, record: Favorite) => (
        <Flex wrap="wrap" gap="4px">
          {(record.tags || []).map((tag: FavoriteTag) => (
            <FavoriteModalTag
              key={tag.label}
              color={tag.color}
              closable
              onClose={(e) => {
                e.preventDefault()
                onRemoveTag(record.id, tag.label)
              }}
            >
              {tag.label}
            </FavoriteModalTag>
          ))}
          {(!record.tags || record.tags.length < 10) && (
            <ClickableFavoriteModalTag icon={<PlusOutlined />} onClick={() => onAddTag(record.id)}>
              添加
            </ClickableFavoriteModalTag>
          )}
        </Flex>
      ),
    },
    {
      title: '保存时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: Favorite) => (
        <Space size="small">
          <ModalFooterButton type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </ModalFooterButton>
          <ModalFooterButton type="link" size="small" onClick={() => onApply(record)}>
            应用
          </ModalFooterButton>
          <ModalFooterButton type="link" size="small" danger onClick={() => onDelete(record.id)}>
            删除
          </ModalFooterButton>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title="收藏列表"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      getContainer={shadowRootManager.getContainer}
      zIndex={MODAL_Z_INDEX}
    >
      <ListSearchContainer>
        <FullWidthSearchInput
          placeholder="搜索收藏名称或内容..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
        />
      </ListSearchContainer>
      <FavoritesTable
        dataSource={filteredFavoritesList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={favoritesColumns}
        rowClassName={(record) => (record.isPinned ? 'pinned-row' : '')}
      />
    </Modal>
  )
}
