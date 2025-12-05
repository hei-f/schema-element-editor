import type { Favorite } from '@/shared/types'
import { render } from '@testing-library/react'
import { FavoritesManager } from '../FavoritesManager'

// Mock子组件
vi.mock('../AddFavoriteModal', () => ({
  AddFavoriteModal: ({ visible }: any) =>
    visible ? <div data-testid="add-favorite-modal">AddFavoriteModal</div> : null,
}))

vi.mock('../FavoritesListModal', () => ({
  FavoritesListModal: ({ visible }: any) =>
    visible ? <div data-testid="favorites-list-modal">FavoritesListModal</div> : null,
}))

vi.mock('../FavoriteEditModal', () => ({
  FavoriteEditModal: ({ visible }: any) =>
    visible ? <div data-testid="edit-modal">FavoriteEditModal</div> : null,
}))

describe('FavoritesManager组件测试', () => {
  const mockFavorite: Favorite = {
    id: 'fav_1',
    name: '测试收藏',
    content: '{"test": "data"}',
    timestamp: Date.now(),
    lastUsedTime: Date.now(),
  }

  const defaultProps = {
    addFavoriteModalVisible: false,
    favoriteNameInput: '',
    favoritesModalVisible: false,
    favoritesList: [],
    editModalVisible: false,
    editingFavoriteId: null,
    editingName: '',
    editingContent: '',
    onAddFavoriteInputChange: vi.fn(),
    onAddFavorite: vi.fn(),
    onCloseAddFavoriteModal: vi.fn(),
    onCloseFavoritesModal: vi.fn(),
    onEditFavorite: vi.fn(),
    onApplyFavorite: vi.fn(),
    onDeleteFavorite: vi.fn(),
    onSaveEdit: vi.fn(),
    onCloseEditModal: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染组件而不报错', () => {
      const { container } = render(<FavoritesManager {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('应该在所有modal都不可见时不渲染任何modal', () => {
      const { queryByTestId } = render(<FavoritesManager {...defaultProps} />)

      expect(queryByTestId('add-favorite-modal')).not.toBeInTheDocument()
      expect(queryByTestId('favorites-list-modal')).not.toBeInTheDocument()
      expect(queryByTestId('preview-modal')).not.toBeInTheDocument()
    })
  })

  describe('AddFavoriteModal显示', () => {
    it('应该在addFavoriteModalVisible为true时渲染AddFavoriteModal', () => {
      const { getByTestId } = render(
        <FavoritesManager {...defaultProps} addFavoriteModalVisible={true} />
      )

      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
    })

    it('应该在addFavoriteModalVisible为false时不渲染AddFavoriteModal', () => {
      const { queryByTestId } = render(
        <FavoritesManager {...defaultProps} addFavoriteModalVisible={false} />
      )

      expect(queryByTestId('add-favorite-modal')).not.toBeInTheDocument()
    })
  })

  describe('FavoritesListModal显示', () => {
    it('应该在favoritesModalVisible为true时渲染FavoritesListModal', () => {
      const { getByTestId } = render(
        <FavoritesManager {...defaultProps} favoritesModalVisible={true} />
      )

      expect(getByTestId('favorites-list-modal')).toBeInTheDocument()
    })

    it('应该在favoritesModalVisible为false时不渲染FavoritesListModal', () => {
      const { queryByTestId } = render(
        <FavoritesManager {...defaultProps} favoritesModalVisible={false} />
      )

      expect(queryByTestId('favorites-list-modal')).not.toBeInTheDocument()
    })
  })

  describe('FavoriteEditModal显示', () => {
    it('应该在editModalVisible为true时渲染FavoriteEditModal', () => {
      const { getByTestId } = render(<FavoritesManager {...defaultProps} editModalVisible={true} />)

      expect(getByTestId('edit-modal')).toBeInTheDocument()
    })

    it('应该在editModalVisible为false时不渲染FavoriteEditModal', () => {
      const { queryByTestId } = render(
        <FavoritesManager {...defaultProps} editModalVisible={false} />
      )

      expect(queryByTestId('edit-modal')).not.toBeInTheDocument()
    })
  })

  describe('多个modal同时显示', () => {
    it('应该支持同时显示多个modal', () => {
      const { getByTestId } = render(
        <FavoritesManager
          {...defaultProps}
          addFavoriteModalVisible={true}
          favoritesModalVisible={true}
          editModalVisible={true}
        />
      )

      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
      expect(getByTestId('favorites-list-modal')).toBeInTheDocument()
      expect(getByTestId('edit-modal')).toBeInTheDocument()
    })

    it('应该支持任意组合的modal显示', () => {
      const { getByTestId, queryByTestId } = render(
        <FavoritesManager
          {...defaultProps}
          addFavoriteModalVisible={true}
          editModalVisible={true}
        />
      )

      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
      expect(queryByTestId('favorites-list-modal')).not.toBeInTheDocument()
      expect(getByTestId('edit-modal')).toBeInTheDocument()
    })
  })

  describe('Props传递', () => {
    it('应该接收favoritesList prop', () => {
      const favorites = [mockFavorite]
      const { container } = render(<FavoritesManager {...defaultProps} favoritesList={favorites} />)

      expect(container).toBeInTheDocument()
    })

    it('应该接收favoriteNameInput prop', () => {
      const { container } = render(
        <FavoritesManager {...defaultProps} favoriteNameInput="测试名称" />
      )

      expect(container).toBeInTheDocument()
    })
  })

  describe('回调函数props', () => {
    it('应该接收所有回调函数', () => {
      const callbacks = {
        onAddFavoriteInputChange: vi.fn(),
        onAddFavorite: vi.fn(),
        onCloseAddFavoriteModal: vi.fn(),
        onCloseFavoritesModal: vi.fn(),
        onPreviewFavorite: vi.fn(),
        onApplyFavorite: vi.fn(),
        onDeleteFavorite: vi.fn(),
        onClosePreviewModal: vi.fn(),
      }

      const { container } = render(<FavoritesManager {...defaultProps} {...callbacks} />)

      expect(container).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理空的favoritesList', () => {
      const { container } = render(<FavoritesManager {...defaultProps} favoritesList={[]} />)

      expect(container).toBeInTheDocument()
    })

    it('应该处理大量favorites', () => {
      const manyFavorites = Array.from({ length: 100 }, (_, i) => ({
        ...mockFavorite,
        id: `fav_${i}`,
        name: `收藏${i}`,
      }))

      const { container } = render(
        <FavoritesManager {...defaultProps} favoritesList={manyFavorites} />
      )

      expect(container).toBeInTheDocument()
    })

    it('应该处理空字符串的input值', () => {
      const { container } = render(<FavoritesManager {...defaultProps} favoriteNameInput="" />)

      expect(container).toBeInTheDocument()
    })

    it('应该处理非常长的favoriteNameInput', () => {
      const longInput = 'a'.repeat(1000)
      const { container } = render(
        <FavoritesManager {...defaultProps} favoriteNameInput={longInput} />
      )

      expect(container).toBeInTheDocument()
    })

    it('应该处理特殊字符的输入', () => {
      const { container } = render(
        <FavoritesManager {...defaultProps} favoriteNameInput="<script>alert('xss')</script>" />
      )

      expect(container).toBeInTheDocument()
    })
  })

  describe('组件更新', () => {
    it('应该支持props更新', () => {
      const { rerender, getByTestId, queryByTestId } = render(
        <FavoritesManager {...defaultProps} addFavoriteModalVisible={false} />
      )

      expect(queryByTestId('add-favorite-modal')).not.toBeInTheDocument()

      rerender(<FavoritesManager {...defaultProps} addFavoriteModalVisible={true} />)

      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
    })

    it('应该支持favoritesList更新', () => {
      const { rerender, container } = render(
        <FavoritesManager {...defaultProps} favoritesList={[]} />
      )

      expect(container).toBeInTheDocument()

      rerender(<FavoritesManager {...defaultProps} favoritesList={[mockFavorite]} />)

      expect(container).toBeInTheDocument()
    })
  })
})
