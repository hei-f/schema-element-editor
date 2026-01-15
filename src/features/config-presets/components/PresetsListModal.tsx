import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import type { ConfigPresetMeta } from '@/shared/types'
import type { TableColumnsType } from 'antd'
import { Modal, Space } from 'antd'
import React, { useMemo } from 'react'
import { generate } from '@ant-design/colors'
import { ModalFooterButton } from '@/shared/styles/modal-button.styles'
import { PresetName, PresetsTable } from '../styles/modals.styles'

interface PresetsListModalProps {
  visible: boolean
  presetsList: ConfigPresetMeta[]
  themeColor: string
  onApply: (preset: ConfigPresetMeta) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

/**
 * 预设配置列表模态框组件
 */
export const PresetsListModal: React.FC<PresetsListModalProps> = ({
  visible,
  presetsList,
  themeColor,
  onApply,
  onDelete,
  onClose,
}) => {
  const { primaryColor, hoverColor, activeColor } = useMemo(() => {
    const colors = generate(themeColor)
    return {
      primaryColor: colors[5],
      hoverColor: colors[4],
      activeColor: colors[6],
    }
  }, [themeColor])

  const presetsColumns: TableColumnsType<ConfigPresetMeta> = [
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
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: ConfigPresetMeta) => (
        <Space size="small">
          <ModalFooterButton
            type="link"
            size="small"
            onClick={async () => {
              await onApply(record)
            }}
            $themeColor={primaryColor}
            $hoverColor={hoverColor}
            $activeColor={activeColor}
          >
            应用
          </ModalFooterButton>
          <ModalFooterButton
            type="link"
            size="small"
            danger
            onClick={() => onDelete(record.id)}
            $themeColor={primaryColor}
            $hoverColor={hoverColor}
            $activeColor={activeColor}
          >
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
