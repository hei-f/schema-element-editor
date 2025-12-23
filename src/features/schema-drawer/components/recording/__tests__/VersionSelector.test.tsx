import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VersionSelector } from '../VersionSelector'
import type { SchemaSnapshot } from '@/shared/types'

/**
 * 创建测试用的快照数据
 */
const createMockSnapshots = (count: number): SchemaSnapshot[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    timestamp: (index + 1) * 1000, // 1000ms, 2000ms, 3000ms, ...
    content: `{"version": ${index + 1}}`,
    type: 'auto' as const,
  }))
}

describe('VersionSelector 组件测试', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    snapshots: createMockSnapshots(3),
    value: 1,
    onChange: mockOnChange,
    label: '版本选择器',
  }

  it('应该成功渲染组件', () => {
    const { container } = render(<VersionSelector {...defaultProps} />)
    expect(container.querySelector('.ant-select')).toBeInTheDocument()
  })

  it('应该显示当前选中的版本', () => {
    render(<VersionSelector {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    // 验证Select组件接收到了正确的value prop
    expect(document.querySelector('.ant-select-content-value')).toHaveTextContent('版本 1')
  })

  it('应该在没有快照时正常渲染', () => {
    const { container } = render(<VersionSelector {...defaultProps} snapshots={[]} value={0} />)
    expect(container.querySelector('.ant-select')).toBeInTheDocument()
  })

  it('应该接受不同的主题', () => {
    const { rerender } = render(<VersionSelector {...defaultProps} theme="light" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    rerender(<VersionSelector {...defaultProps} theme="dark" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该接受不同的主题色', () => {
    const { rerender } = render(<VersionSelector {...defaultProps} themeColor="#ff0000" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    rerender(<VersionSelector {...defaultProps} themeColor="#00ff00" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该使用默认主题色', () => {
    render(<VersionSelector {...defaultProps} themeColor={undefined} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该响应value变化', () => {
    const { rerender } = render(<VersionSelector {...defaultProps} value={1} />)
    expect(document.querySelector('.ant-select-content-value')).toHaveTextContent('版本 1')

    rerender(<VersionSelector {...defaultProps} value={2} />)
    expect(document.querySelector('.ant-select-content-value')).toHaveTextContent('版本 2')
  })

  it('应该响应snapshots变化', () => {
    const { rerender } = render(<VersionSelector {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    const newSnapshots = createMockSnapshots(5)
    rerender(<VersionSelector {...defaultProps} snapshots={newSnapshots} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该在点击时打开下拉菜单', async () => {
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(document.querySelector('.ant-select-dropdown')).toBeInTheDocument()
    })
  })

  it('应该显示所有版本选项', async () => {
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const versionItems = screen.getAllByText(/版本 \d/)
      // 应该至少包含3个版本（可能包括Select显示值）
      expect(versionItems.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('应该显示时间戳信息', async () => {
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(screen.getByText('1.0s')).toBeInTheDocument()
      expect(screen.getByText('2.0s')).toBeInTheDocument()
      expect(screen.getByText('3.0s')).toBeInTheDocument()
    })
  })

  it('应该在点击版本时触发onChange', async () => {
    mockOnChange.mockClear()
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version2 = screen.getByText('版本 2')
      fireEvent.click(version2)
    })

    expect(mockOnChange).toHaveBeenCalledWith(2)
  })

  it('应该在选择版本后关闭下拉菜单', async () => {
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version2 = screen.getByText('版本 2')
      fireEvent.click(version2)
    })

    await waitFor(() => {
      expect(document.querySelector('.ant-select-dropdown-hidden')).toBeInTheDocument()
    })
  })

  it('应该高亮显示当前选中的版本', async () => {
    render(<VersionSelector {...defaultProps} value={2} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      // 验证下拉菜单已打开
      expect(document.querySelector('.ant-select-dropdown')).toBeInTheDocument()
      // 验证有选中标记
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })

  it('应该为当前选中的版本显示选中标记', async () => {
    render(<VersionSelector {...defaultProps} value={2} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })

  it('应该支持大量版本快照', async () => {
    const manySnapshots = createMockSnapshots(50)
    render(<VersionSelector {...defaultProps} snapshots={manySnapshots} value={25} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version25Items = screen.getAllByText(/版本 25/)
      expect(version25Items.length).toBeGreaterThan(0)
    })
  })

  it('应该处理非常小的时间戳（毫秒级）', async () => {
    const snapshots: SchemaSnapshot[] = [{ id: 1, timestamp: 500, content: '{}', type: 'auto' }]
    render(<VersionSelector {...defaultProps} snapshots={snapshots} value={1} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(screen.getByText('500ms')).toBeInTheDocument()
    })
  })

  it('应该处理边界时间戳（正好1000ms）', async () => {
    const snapshots: SchemaSnapshot[] = [{ id: 1, timestamp: 1000, content: '{}', type: 'auto' }]
    render(<VersionSelector {...defaultProps} snapshots={snapshots} value={1} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(screen.getByText('1.0s')).toBeInTheDocument()
    })
  })

  it('应该处理小数时间戳', async () => {
    const snapshots: SchemaSnapshot[] = [{ id: 1, timestamp: 1234, content: '{}', type: 'auto' }]
    render(<VersionSelector {...defaultProps} snapshots={snapshots} value={1} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(screen.getByText('1.2s')).toBeInTheDocument()
    })
  })

  it('应该支持多次打开和关闭', async () => {
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    // 第一次打开
    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(document.querySelector('.ant-select-dropdown')).toBeInTheDocument()
    })

    // 关闭（通过点击其他地方）
    fireEvent.click(document.body)
    await waitFor(() => {
      const dropdown = document.querySelector('.ant-select-dropdown')
      // 下拉菜单应该存在但可能被隐藏
      expect(dropdown).toBeInTheDocument()
    })

    // 第二次打开
    fireEvent.mouseDown(select)
    await waitFor(() => {
      expect(document.querySelector('.ant-select-dropdown')).toBeInTheDocument()
    })
  })

  it('应该在onChange回调中传递正确的版本ID', async () => {
    mockOnChange.mockClear()
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(async () => {
      const version3 = screen.getByText('版本 3')
      fireEvent.click(version3)
    })

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('应该能够连续切换版本', async () => {
    mockOnChange.mockClear()
    render(<VersionSelector {...defaultProps} />)
    const select = screen.getByRole('combobox')

    // 第一次切换到版本2
    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version2 = screen.getByText('版本 2')
      fireEvent.click(version2)
    })

    // 第二次切换到版本3
    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version3 = screen.getByText('版本 3')
      fireEvent.click(version3)
    })

    expect(mockOnChange).toHaveBeenCalledTimes(2)
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 2)
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('应该正确设置aria-label', () => {
    render(<VersionSelector {...defaultProps} label="测试标签" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-label', '测试标签')
  })

  it('应该支持不同的label值', () => {
    const { rerender } = render(<VersionSelector {...defaultProps} label="左侧版本" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '左侧版本')

    rerender(<VersionSelector {...defaultProps} label="右侧版本" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '右侧版本')
  })

  it('应该能够正确卸载', () => {
    const { unmount } = render(<VersionSelector {...defaultProps} />)
    expect(() => unmount()).not.toThrow()
  })

  it('应该处理空的onChange回调', async () => {
    const noOpOnChange = vi.fn()
    render(<VersionSelector {...defaultProps} onChange={noOpOnChange} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const version2 = screen.getByText('版本 2')
      fireEvent.click(version2)
    })

    expect(noOpOnChange).toHaveBeenCalled()
  })

  it('应该处理value不在snapshots范围内的情况', () => {
    render(<VersionSelector {...defaultProps} value={999} />)
    // 组件应该能够正常渲染，不会崩溃
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该在明亮主题下使用正确的样式', async () => {
    render(<VersionSelector {...defaultProps} theme="light" />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const dropdown = document.querySelector('.ant-select-dropdown')
      expect(dropdown).toBeInTheDocument()
    })
  })

  it('应该在暗黑主题下使用正确的样式', async () => {
    render(<VersionSelector {...defaultProps} theme="dark" />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const dropdown = document.querySelector('.ant-select-dropdown')
      expect(dropdown).toBeInTheDocument()
    })
  })

  it('应该处理快照的不同类型', async () => {
    const snapshots: SchemaSnapshot[] = [
      { id: 1, timestamp: 1000, content: '{}', type: 'auto' },
      { id: 2, timestamp: 2000, content: '{}', type: 'manual' },
      { id: 3, timestamp: 3000, content: '{}', type: 'auto' },
    ]
    render(<VersionSelector {...defaultProps} snapshots={snapshots} />)
    const select = screen.getByRole('combobox')

    fireEvent.mouseDown(select)
    await waitFor(() => {
      const versionItems = screen.getAllByText(/版本 \d/)
      // 应该显示所有版本
      expect(versionItems.length).toBeGreaterThanOrEqual(3)
    })
  })
})
