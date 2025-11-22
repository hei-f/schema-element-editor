import type { Favorite } from '@/shared/types'
import type { TableColumnsType } from 'antd'
import { Button, Modal, Space, Table } from 'antd'
import React from 'react'

interface FavoritesListModalProps {
  visible: boolean
  favoritesList: Favorite[]
  shadowRoot: ShadowRoot
  onPreview: (favorite: Favorite) => void
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
  shadowRoot,
  onPreview,
  onApply,
  onDelete,
  onClose
}) => {
  const getContainer = () => shadowRoot as any

  const favoritesColumns: TableColumnsType<Favorite> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true
    },
    {
      title: '来源参数',
      dataIndex: 'sourceParams',
      key: 'sourceParams',
      width: 160,
      ellipsis: true
    },
    {
      title: '保存时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Favorite) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onPreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" onClick={() => onApply(record)}>
            应用
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Modal
      title="收藏列表"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      getContainer={getContainer}
    >
      <Table
        dataSource={favoritesList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={favoritesColumns}
      />
    </Modal>
  )
}

