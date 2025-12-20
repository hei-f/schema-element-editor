import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { ConfigPreset } from '@/shared/types'
import type { TableColumnsType } from 'antd'
import { Modal, Space } from 'antd'
import React from 'react'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'
import { PresetName, PresetsTable } from '../styles/modals.styles'

interface PresetsListModalProps {
  visible: boolean
  presetsList: ConfigPreset[]
  onApply: (preset: ConfigPreset) => void
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

/**
 * 预设配置列表模态框组件
 */
export const PresetsListModal: React.FC<PresetsListModalProps> = ({
  visible,
  presetsList,
  onApply,
  onDelete,
  onClose,
}) => {
  const presetsColumns: TableColumnsType<ConfigPreset> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name: string) => <PresetName>{name}</PresetName>,
    },
    {
      title: '保存时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedTime',
      key: 'lastUsedTime',
      width: 180,
      render: (lastUsedTime: number) => new Date(lastUsedTime).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: ConfigPreset) => (
        <Space size="small">
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
      title="预设配置管理"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      zIndex={MODAL_Z_INDEX}
    >
      <PresetsTable
        dataSource={presetsList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={presetsColumns}
      />
    </Modal>
  )
}
