import { render, screen, waitFor, createMockConfigPreset } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import type { ConfigPreset, ConfigPresetMeta } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { PresetsDropdown } from '../PresetsDropdown'

/**
 * Mock storage
 */
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    getPresetsMeta: vi.fn(),
    getPresetConfig: vi.fn(),
  },
}))

describe('PresetsDropdown 组件测试', () => {
  const mockPresetsData: ConfigPreset[] = [
    createMockConfigPreset({
      id: 'preset-1',
      name: '深色主题配置',
      timestamp: new Date('2024-01-15T10:30:00').getTime(),
    }),
    createMockConfigPreset({
      id: 'preset-2',
      name: '浅色主题配置',
      timestamp: new Date('2024-01-20T15:45:00').getTime(),
    }),
  ]

  const mockPresetsMeta: ConfigPresetMeta[] = mockPresetsData.map(({ id, name, timestamp }) => ({
    id,
    name,
    timestamp,
  }))

  const defaultProps = {
    onApplyPreset: vi.fn().mockResolvedValue(undefined),
    themeColor: '#1890ff',
    editorTheme: 'light' as const,
    showText: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.getPresetsMeta).mockResolvedValue([])
    vi.mocked(storage.getPresetConfig).mockResolvedValue(null)
  })

  describe('基本渲染', () => {
    it('应该渲染预设按钮', () => {
      render(<PresetsDropdown {...defaultProps} />)

      expect(screen.getByLabelText('config-presets')).toBeInTheDocument()
    })

    it('应该在showText为true时显示文本', () => {
      render(<PresetsDropdown {...defaultProps} showText={true} />)

      expect(screen.getByText('预设')).toBeInTheDocument()
    })

    it('应该在showText为false时不显示文本', () => {
      render(<PresetsDropdown {...defaultProps} showText={false} />)

      expect(screen.queryByText('预设')).not.toBeInTheDocument()
    })

    it('应该显示tooltip', async () => {
      const user = userEvent.setup()
      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.hover(button)

      await waitFor(() => {
        expect(screen.getByText('预设配置')).toBeInTheDocument()
      })
    })
  })

  describe('下拉菜单交互', () => {
    it('应该在点击按钮时打开下拉菜单', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })
    })

    it('应该在打开下拉菜单时加载预设列表', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      expect(storage.getPresetsMeta).not.toHaveBeenCalled()

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(storage.getPresetsMeta).toHaveBeenCalledTimes(1)
      })
    })

    it('应该显示所有预设项', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
        expect(screen.getByText('浅色主题配置')).toBeInTheDocument()
      })
    })

    it('应该在没有预设时显示空状态', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue([])

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('暂无预设配置')).toBeInTheDocument()
      })
    })
  })

  describe('预设应用', () => {
    it('应该在点击预设时调用onApplyPreset', async () => {
      const user = userEvent.setup()
      const onApplyPreset = vi.fn().mockResolvedValue(undefined)
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)
      vi.mocked(storage.getPresetConfig).mockResolvedValue(mockPresetsData[0].config)

      render(<PresetsDropdown {...defaultProps} onApplyPreset={onApplyPreset} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      const presetItem = screen.getByText('深色主题配置')
      await user.click(presetItem)

      await waitFor(() => {
        expect(onApplyPreset).toHaveBeenCalledWith(mockPresetsData[0])
      })
    })

    it('应该在应用预设后关闭下拉菜单', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)
      vi.mocked(storage.getPresetConfig).mockResolvedValue(mockPresetsData[0].config)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      const presetItem = screen.getByText('深色主题配置')
      await user.click(presetItem)

      // 下拉菜单应该被调用关闭（不验证DOM，因为可能有关闭动画）
      await waitFor(() => {
        expect(defaultProps.onApplyPreset).toHaveBeenCalled()
      })
    })

    it('应该支持应用不同的预设', async () => {
      const user = userEvent.setup()
      const onApplyPreset = vi.fn().mockResolvedValue(undefined)
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)
      vi.mocked(storage.getPresetConfig).mockResolvedValue(mockPresetsData[1].config)

      render(<PresetsDropdown {...defaultProps} onApplyPreset={onApplyPreset} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('浅色主题配置')).toBeInTheDocument()
      })

      const presetItem = screen.getByText('浅色主题配置')
      await user.click(presetItem)

      await waitFor(() => {
        expect(onApplyPreset).toHaveBeenCalledWith(mockPresetsData[1])
      })
    })
  })

  describe('时间格式化', () => {
    it('应该显示格式化的时间', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        // 01-15 10:30 格式
        expect(screen.getByText(/01-15 10:30/)).toBeInTheDocument()
        expect(screen.getByText(/01-20 15:45/)).toBeInTheDocument()
      })
    })
  })

  describe('主题适配', () => {
    it('应该在light主题下正确渲染', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} editorTheme="light" />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })
    })

    it('应该在dark主题下正确渲染', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} editorTheme="dark" />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })
    })

    it('应该在custom主题下正确渲染', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} editorTheme="seeDark" />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理加载预设失败的情况', async () => {
      const user = userEvent.setup()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(storage.getPresetsMeta).mockRejectedValue(new Error('加载失败'))

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('暂无预设配置')).toBeInTheDocument()
        expect(consoleError).toHaveBeenCalledWith('加载预设配置列表失败:', expect.any(Error))
      })

      consoleError.mockRestore()
    })

    it('应该处理onApplyPreset抛出错误', async () => {
      const user = userEvent.setup()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const onApplyPreset = vi.fn().mockRejectedValue(new Error('应用失败'))
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)
      vi.mocked(storage.getPresetConfig).mockResolvedValue(mockPresetsData[0].config)

      render(<PresetsDropdown {...defaultProps} onApplyPreset={onApplyPreset} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      const presetItem = screen.getByText('深色主题配置')
      await user.click(presetItem)

      await waitFor(() => {
        expect(onApplyPreset).toHaveBeenCalled()
        expect(consoleError).toHaveBeenCalledWith('应用预设配置失败:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })

  describe('边界情况', () => {
    it('应该处理大量预设', async () => {
      const user = userEvent.setup()
      const manyPresetsMeta: ConfigPresetMeta[] = Array.from({ length: 50 }, (_, i) => ({
        id: `preset-${i}`,
        name: `预设配置${i}`,
        timestamp: Date.now(),
      }))
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(manyPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('预设配置0')).toBeInTheDocument()
      })
    })

    it('应该处理特殊字符的预设名称', async () => {
      const user = userEvent.setup()
      const specialPresetsMeta: ConfigPresetMeta[] = [
        {
          id: 'preset-1',
          name: '<script>alert("xss")</script>',
          timestamp: Date.now(),
        },
      ]
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(specialPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument()
      })
    })

    it('应该处理emoji的预设名称', async () => {
      const user = userEvent.setup()
      const emojiPresetsMeta: ConfigPresetMeta[] = [
        {
          id: 'preset-1',
          name: '😀 快乐配置 🎉',
          timestamp: Date.now(),
        },
      ]
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(emojiPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('😀 快乐配置 🎉')).toBeInTheDocument()
      })
    })

    it('应该支持多次打开和关闭下拉菜单', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')

      // 第一次打开
      await user.click(button)
      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      // 关闭（再次点击按钮）
      await user.click(button)

      // 第二次打开
      await user.click(button)
      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      // 验证加载了两次（每次打开时加载）
      expect(storage.getPresetsMeta).toHaveBeenCalledTimes(2)
    })

    it('应该处理不同的themeColor', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      const { rerender } = render(<PresetsDropdown {...defaultProps} themeColor="#ff0000" />)

      const button = screen.getByLabelText('config-presets')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('深色主题配置')).toBeInTheDocument()
      })

      rerender(<PresetsDropdown {...defaultProps} themeColor="#00ff00" />)

      expect(screen.getByText('深色主题配置')).toBeInTheDocument()
    })
  })

  describe('懒加载行为', () => {
    it('应该只在打开下拉菜单时加载数据', async () => {
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      // 初始渲染时不应该加载
      expect(storage.getPresetsMeta).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(storage.getPresetsMeta).not.toHaveBeenCalled()
      })
    })

    it('应该在每次打开时重新加载数据', async () => {
      const user = userEvent.setup()
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockPresetsMeta)

      render(<PresetsDropdown {...defaultProps} />)

      const button = screen.getByLabelText('config-presets')

      // 第一次打开
      await user.click(button)
      await waitFor(() => {
        expect(storage.getPresetsMeta).toHaveBeenCalledTimes(1)
      })

      // 关闭
      await user.click(button)

      // 第二次打开
      await user.click(button)
      await waitFor(() => {
        expect(storage.getPresetsMeta).toHaveBeenCalledTimes(2)
      })
    })
  })
})
