import type { Favorite } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import type { TableColumnsType } from 'antd'
import { Button, Modal, Space, Table } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { FullWidthSearchInput, ListSearchContainer } from '../styles/modals.styles'

interface FavoritesListModalProps {
  visible: boolean
  favoritesList: Favorite[]
  onEdit: (favorite: Favorite) => void
  onApply: (favorite: Favorite) => void
  onDelete: (id: string) => Promise<void>
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '保存时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Favorite) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => onApply(record)}>
            应用
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
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
      width={800}
      getContainer={shadowRootManager.getContainer}
    >
      <ListSearchContainer>
        <FullWidthSearchInput
          placeholder="搜索收藏名称或内容..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
        />
      </ListSearchContainer>
      <Table
        dataSource={filteredFavoritesList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={favoritesColumns}
      />
    </Modal>
  )
}
