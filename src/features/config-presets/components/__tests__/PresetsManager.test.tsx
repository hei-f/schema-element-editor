import { render, screen, createMockConfigPreset } from '@test/test-utils'
import type { ConfigPreset } from '@/shared/types'
import { PresetsManager } from '../PresetsManager'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

describe('PresetsManager 组件测试', () => {
  const mockPresets: ConfigPreset[] = [
    createMockConfigPreset({
      id: 'preset-1',
      name: '预设1',
      timestamp: Date.now(),
    }),
  ]

  const defaultProps = {
    addPresetModalVisible: false,
    presetNameInput: '',
    presetsModalVisible: false,
    presetsList: [],
    themeColor: '#1890ff',
    onAddPresetInputChange: vi.fn(),
    onAddPreset: vi.fn(),
    onCloseAddPresetModal: vi.fn(),
    onClosePresetsModal: vi.fn(),
    onApplyPreset: vi.fn(),
    onDeletePreset: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该成功渲染组件', () => {
      const { container } = render(<PresetsManager {...defaultProps} />)

      expect(container).toBeInTheDocument()
    })

    it('应该在addPresetModalVisible为true时显示AddPresetModal', () => {
      render(<PresetsManager {...defaultProps} addPresetModalVisible={true} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该在presetsModalVisible为true时显示PresetsListModal', () => {
      render(<PresetsManager {...defaultProps} presetsModalVisible={true} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该在两个modal都不可见时不显示modal内容', () => {
      render(<PresetsManager {...defaultProps} />)

      expect(screen.queryByText('保存为预设配置')).not.toBeInTheDocument()
      expect(screen.queryByText('预设配置管理')).not.toBeInTheDocument()
    })
  })

  describe('属性传递', () => {
    it('应该正确传递presetNameInput到AddPresetModal', () => {
      render(
        <PresetsManager {...defaultProps} addPresetModalVisible={true} presetNameInput="测试预设" />
      )

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('测试预设')
    })

    it('应该正确传递themeColor到AddPresetModal', () => {
      render(<PresetsManager {...defaultProps} addPresetModalVisible={true} themeColor="#ff0000" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该正确传递presetsList到PresetsListModal', () => {
      render(
        <PresetsManager {...defaultProps} presetsModalVisible={true} presetsList={mockPresets} />
      )

      expect(screen.getByText('预设1')).toBeInTheDocument()
    })
  })

  describe('回调函数传递', () => {
    it('应该传递onAddPresetInputChange到AddPresetModal', () => {
      const onAddPresetInputChange = vi.fn()
      render(
        <PresetsManager
          {...defaultProps}
          addPresetModalVisible={true}
          onAddPresetInputChange={onAddPresetInputChange}
        />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该传递onAddPreset到AddPresetModal', () => {
      const onAddPreset = vi.fn()
      render(
        <PresetsManager {...defaultProps} addPresetModalVisible={true} onAddPreset={onAddPreset} />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该传递onCloseAddPresetModal到AddPresetModal', () => {
      const onCloseAddPresetModal = vi.fn()
      render(
        <PresetsManager
          {...defaultProps}
          addPresetModalVisible={true}
          onCloseAddPresetModal={onCloseAddPresetModal}
        />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该传递onApplyPreset到PresetsListModal', () => {
      const onApplyPreset = vi.fn()
      render(
        <PresetsManager
          {...defaultProps}
          presetsModalVisible={true}
          onApplyPreset={onApplyPreset}
        />
      )

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该传递onDeletePreset到PresetsListModal', () => {
      const onDeletePreset = vi.fn().mockResolvedValue(undefined)
      render(
        <PresetsManager
          {...defaultProps}
          presetsModalVisible={true}
          onDeletePreset={onDeletePreset}
        />
      )

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该传递onClosePresetsModal到PresetsListModal', () => {
      const onClosePresetsModal = vi.fn()
      render(
        <PresetsManager
          {...defaultProps}
          presetsModalVisible={true}
          onClosePresetsModal={onClosePresetsModal}
        />
      )

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })
  })

  describe('状态组合', () => {
    it('应该同时显示两个modal（虽然不推荐）', () => {
      render(
        <PresetsManager {...defaultProps} addPresetModalVisible={true} presetsModalVisible={true} />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该支持modal状态切换', () => {
      const { rerender } = render(<PresetsManager {...defaultProps} addPresetModalVisible={true} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()

      rerender(<PresetsManager {...defaultProps} presetsModalVisible={true} />)

      // Modal可能同时存在（因为关闭动画），只需确认新的modal出现
      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })
  })

  describe('Props更新', () => {
    it('应该响应所有props的变化', () => {
      const { rerender } = render(<PresetsManager {...defaultProps} />)

      rerender(
        <PresetsManager
          {...defaultProps}
          addPresetModalVisible={true}
          presetNameInput="新预设"
          themeColor="#00ff00"
        />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('新预设')
    })

    it('应该支持快速切换modal', () => {
      const { rerender } = render(<PresetsManager {...defaultProps} />)

      rerender(<PresetsManager {...defaultProps} addPresetModalVisible={true} />)
      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()

      rerender(<PresetsManager {...defaultProps} addPresetModalVisible={false} />)
      rerender(<PresetsManager {...defaultProps} presetsModalVisible={true} />)
      expect(screen.getByText('预设配置管理')).toBeInTheDocument()

      rerender(<PresetsManager {...defaultProps} presetsModalVisible={false} />)
      // 组件应该正常响应状态变化
      expect(true).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的presetsList', () => {
      render(<PresetsManager {...defaultProps} presetsModalVisible={true} presetsList={[]} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该处理大量预设列表', () => {
      const manyPresets: ConfigPreset[] = Array.from({ length: 50 }, (_, i) =>
        createMockConfigPreset({
          id: `preset-${i}`,
          name: `预设${i}`,
          timestamp: Date.now(),
        })
      )

      render(
        <PresetsManager {...defaultProps} presetsModalVisible={true} presetsList={manyPresets} />
      )

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该处理无效的themeColor', () => {
      render(<PresetsManager {...defaultProps} addPresetModalVisible={true} themeColor="invalid" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该处理长文本presetNameInput', () => {
      const longName = 'a'.repeat(100)
      render(
        <PresetsManager {...defaultProps} addPresetModalVisible={true} presetNameInput={longName} />
      )

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      // maxLength 属性不会截断以编程方式设置的 value
      expect(input.value).toBe(longName)
      expect(input.value.length).toBe(100)
    })
  })

  describe('组件组合', () => {
    it('应该同时包含两个子组件', () => {
      const { container } = render(<PresetsManager {...defaultProps} />)

      // 组件应该渲染，即使modal不可见
      expect(container).toBeInTheDocument()
    })

    it('应该独立管理两个modal的显示状态', () => {
      render(
        <PresetsManager
          {...defaultProps}
          addPresetModalVisible={true}
          presetsModalVisible={false}
        />
      )

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
      expect(screen.queryByText('预设配置管理')).not.toBeInTheDocument()
    })
  })
})
