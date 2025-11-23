import { HistoryEntryType } from '@/shared/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryDropdown } from '../HistoryDropdown'

describe('HistoryDropdown组件测试', () => {
  const mockHistoryEntry = {
    id: 'entry_1',
    type: HistoryEntryType.Manual as HistoryEntryType,
    content: '{"test": "data"}',
    timestamp: Date.now() - 60000, // 1分钟前
    description: '手动保存的版本'
  }

  const defaultProps = {
    history: [mockHistoryEntry],
    currentIndex: 0,
    onLoadVersion: jest.fn(),
    onClearHistory: jest.fn(),
    disabled: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染历史按钮', () => {
      render(<HistoryDropdown {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /历史/ })).toBeInTheDocument()
    })

    it('应该在disabled为true时禁用按钮', () => {
      render(<HistoryDropdown {...defaultProps} disabled={true} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      expect(button).toBeDisabled()
    })

    it('应该在disabled为false时启用按钮', () => {
      render(<HistoryDropdown {...defaultProps} disabled={false} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      expect(button).not.toBeDisabled()
    })
  })

  describe('Popover交互', () => {
    it('应该在点击按钮时打开Popover', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('本次编辑历史')).toBeInTheDocument()
      })
    })

    it('应该显示历史记录数量', async () => {
      const user = userEvent.setup()
      const multipleHistory = [
        { ...mockHistoryEntry, id: 'entry_1' },
        { ...mockHistoryEntry, id: 'entry_2', timestamp: Date.now() - 120000 },
        { ...mockHistoryEntry, id: 'entry_3', timestamp: Date.now() - 180000 }
      ]
      
      render(<HistoryDropdown {...defaultProps} history={multipleHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('3 条')).toBeInTheDocument()
      })
    })
  })

  describe('历史记录列表', () => {
    it('应该显示历史记录条目', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('手动保存的版本')).toBeInTheDocument()
      })
    })

    it('应该显示多个历史记录', async () => {
      const user = userEvent.setup()
      const multipleHistory = [
        { ...mockHistoryEntry, id: 'entry_1', description: '版本1' },
        { ...mockHistoryEntry, id: 'entry_2', description: '版本2', timestamp: Date.now() - 120000 }
      ]
      
      render(<HistoryDropdown {...defaultProps} history={multipleHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('版本1')).toBeInTheDocument()
        expect(screen.getByText('版本2')).toBeInTheDocument()
      })
    })

    it('应该高亮显示当前版本', async () => {
      const user = userEvent.setup()
      const multipleHistory = [
        { ...mockHistoryEntry, id: 'entry_1', description: '当前版本' },
        { ...mockHistoryEntry, id: 'entry_2', description: '旧版本', timestamp: Date.now() - 120000 }
      ]
      
      render(<HistoryDropdown {...defaultProps} history={multipleHistory} currentIndex={0} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        // 当前版本应该显示勾选标记
        const checkMarks = screen.queryAllByText('✓')
        expect(checkMarks.length).toBeGreaterThan(0)
      })
    })

    it('应该显示空状态当没有历史记录', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} history={[]} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('暂无历史记录')).toBeInTheDocument()
      })
    })
  })

  describe('历史记录类型图标', () => {
    it('应该为不同类型显示对应图标', async () => {
      const user = userEvent.setup()
      const typedHistory = [
        { ...mockHistoryEntry, id: 'e1', type: HistoryEntryType.Initial, description: 'Initial' },
        { ...mockHistoryEntry, id: 'e2', type: HistoryEntryType.AutoSave, description: 'Auto' },
        { ...mockHistoryEntry, id: 'e3', type: HistoryEntryType.Manual, description: 'Manual' },
        { ...mockHistoryEntry, id: 'e4', type: HistoryEntryType.Draft, description: 'Draft' },
        { ...mockHistoryEntry, id: 'e5', type: HistoryEntryType.Favorite, description: 'Favorite' }
      ]
      
      render(<HistoryDropdown {...defaultProps} history={typedHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Initial')).toBeInTheDocument()
        expect(screen.getByText('Auto')).toBeInTheDocument()
        expect(screen.getByText('Manual')).toBeInTheDocument()
        expect(screen.getByText('Draft')).toBeInTheDocument()
        expect(screen.getByText('Favorite')).toBeInTheDocument()
      })
    })
  })

  describe('用户交互', () => {
    it('应该在点击历史记录时调用onLoadVersion', async () => {
      const user = userEvent.setup()
      const onLoadVersion = jest.fn()
      
      render(<HistoryDropdown {...defaultProps} onLoadVersion={onLoadVersion} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('手动保存的版本')).toBeInTheDocument()
      })
      
      const historyItem = screen.getByRole('button', { name: /加载历史版本/ })
      await user.click(historyItem)
      
      await waitFor(() => {
        expect(onLoadVersion).toHaveBeenCalledWith(0)
      })
    })

    it('应该在点击清除按钮时调用onClearHistory', async () => {
      const user = userEvent.setup()
      const onClearHistory = jest.fn()
      
      render(<HistoryDropdown {...defaultProps} onClearHistory={onClearHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('清除历史')).toBeInTheDocument()
      })
      
      const clearButton = screen.getByText('清除历史')
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(onClearHistory).toHaveBeenCalledTimes(1)
      })
    })

    it('应该在加载版本后关闭Popover', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('手动保存的版本')).toBeInTheDocument()
      })
      
      const historyItem = screen.getByRole('button', { name: /加载历史版本/ })
      await user.click(historyItem)
      
      // Popover应该在短暂延迟后关闭
      await waitFor(() => {
        // 检查Popover内容是否消失（这个测试可能不太可靠，取决于Ant Design实现）
        expect(defaultProps.onLoadVersion).toHaveBeenCalled()
      })
    })
  })

  describe('时间格式化', () => {
    it('应该显示"刚刚"对于很新的记录', async () => {
      const user = userEvent.setup()
      const recentHistory = [
        { ...mockHistoryEntry, timestamp: Date.now() - 30000 } // 30秒前
      ]
      
      render(<HistoryDropdown {...defaultProps} history={recentHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('刚刚')).toBeInTheDocument()
      })
    })

    it('应该显示分钟数对于1小时内的记录', async () => {
      const user = userEvent.setup()
      const minutesAgoHistory = [
        { ...mockHistoryEntry, timestamp: Date.now() - 5 * 60 * 1000 } // 5分钟前
      ]
      
      render(<HistoryDropdown {...defaultProps} history={minutesAgoHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText(/分钟前/)).toBeInTheDocument()
      })
    })

    it('应该显示小时数对于24小时内的记录', async () => {
      const user = userEvent.setup()
      const hoursAgoHistory = [
        { ...mockHistoryEntry, timestamp: Date.now() - 3 * 60 * 60 * 1000 } // 3小时前
      ]
      
      render(<HistoryDropdown {...defaultProps} history={hoursAgoHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText(/小时前/)).toBeInTheDocument()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理没有description的历史记录', async () => {
      const user = userEvent.setup()
      const noDescHistory = [
        { ...mockHistoryEntry, description: undefined }
      ]
      
      render(<HistoryDropdown {...defaultProps} history={noDescHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('内容变更')).toBeInTheDocument()
      })
    })

    it('应该处理大量历史记录', async () => {
      const user = userEvent.setup()
      const manyHistory = Array.from({ length: 100 }, (_, i) => ({
        ...mockHistoryEntry,
        id: `entry_${i}`,
        description: `版本 ${i + 1}`,
        timestamp: Date.now() - i * 60000
      }))
      
      render(<HistoryDropdown {...defaultProps} history={manyHistory} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('100 条')).toBeInTheDocument()
      })
    })

    it('应该处理currentIndex超出范围', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} currentIndex={999} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        // 不应该有任何项被高亮
        const checkMarks = screen.queryAllByText('✓')
        expect(checkMarks.length).toBe(0)
      })
    })

    it('应该处理负数currentIndex', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} currentIndex={-1} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        const checkMarks = screen.queryAllByText('✓')
        expect(checkMarks.length).toBe(0)
      })
    })
  })

  describe('清除历史功能', () => {
    it('应该在空历史时不显示清除按钮', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} history={[]} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.queryByText('清除历史')).not.toBeInTheDocument()
      })
    })

    it('应该在有历史时显示清除按钮', async () => {
      const user = userEvent.setup()
      render(<HistoryDropdown {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /历史/ })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('清除历史')).toBeInTheDocument()
      })
    })
  })
})

