import type { Favorite } from '@/shared/types'
import { render } from '@testing-library/react'
import { FavoritesManager } from '../FavoritesManager'

// Mock子组件
jest.mock('../AddFavoriteModal', () => ({
  AddFavoriteModal: ({ visible }: any) => 
    visible ? <div data-testid="add-favorite-modal">AddFavoriteModal</div> : null
}))

jest.mock('../FavoritesListModal', () => ({
  FavoritesListModal: ({ visible }: any) => 
    visible ? <div data-testid="favorites-list-modal">FavoritesListModal</div> : null
}))

jest.mock('../FavoritePreviewModal', () => ({
  FavoritePreviewModal: ({ visible }: any) => 
    visible ? <div data-testid="preview-modal">FavoritePreviewModal</div> : null
}))

const mockShadowRoot = document.createElement('div') as any

describe('FavoritesManager组件测试', () => {
  const mockFavorite: Favorite = {
    id: 'fav_1',
    name: '测试收藏',
    content: '{"test": "data"}',
    timestamp: Date.now(),
    sourceParams: 'test-params',
    lastUsedTime: Date.now()
  }

  const defaultProps = {
    shadowRoot: mockShadowRoot,
    addFavoriteModalVisible: false,
    favoriteNameInput: '',
    favoritesModalVisible: false,
    favoritesList: [],
    previewModalVisible: false,
    previewTitle: '',
    previewContent: '',
    onAddFavoriteInputChange: jest.fn(),
    onAddFavorite: jest.fn(),
    onCloseAddFavoriteModal: jest.fn(),
    onCloseFavoritesModal: jest.fn(),
    onPreviewFavorite: jest.fn(),
    onApplyFavorite: jest.fn(),
    onDeleteFavorite: jest.fn(),
    onClosePreviewModal: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('FavoritePreviewModal显示', () => {
    it('应该在previewModalVisible为true时渲染FavoritePreviewModal', () => {
      const { getByTestId } = render(
        <FavoritesManager {...defaultProps} previewModalVisible={true} />
      )
      
      expect(getByTestId('preview-modal')).toBeInTheDocument()
    })

    it('应该在previewModalVisible为false时不渲染FavoritePreviewModal', () => {
      const { queryByTestId } = render(
        <FavoritesManager {...defaultProps} previewModalVisible={false} />
      )
      
      expect(queryByTestId('preview-modal')).not.toBeInTheDocument()
    })
  })

  describe('多个modal同时显示', () => {
    it('应该支持同时显示多个modal', () => {
      const { getByTestId } = render(
        <FavoritesManager
          {...defaultProps}
          addFavoriteModalVisible={true}
          favoritesModalVisible={true}
          previewModalVisible={true}
        />
      )
      
      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
      expect(getByTestId('favorites-list-modal')).toBeInTheDocument()
      expect(getByTestId('preview-modal')).toBeInTheDocument()
    })

    it('应该支持任意组合的modal显示', () => {
      const { getByTestId, queryByTestId } = render(
        <FavoritesManager
          {...defaultProps}
          addFavoriteModalVisible={true}
          previewModalVisible={true}
        />
      )
      
      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
      expect(queryByTestId('favorites-list-modal')).not.toBeInTheDocument()
      expect(getByTestId('preview-modal')).toBeInTheDocument()
    })
  })

  describe('Props传递', () => {
    it('应该接收shadowRoot prop', () => {
      const customShadowRoot = document.createElement('div') as any
      const { container } = render(
        <FavoritesManager {...defaultProps} shadowRoot={customShadowRoot} />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该接收favoritesList prop', () => {
      const favorites = [mockFavorite]
      const { container } = render(
        <FavoritesManager {...defaultProps} favoritesList={favorites} />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该接收favoriteNameInput prop', () => {
      const { container } = render(
        <FavoritesManager {...defaultProps} favoriteNameInput="测试名称" />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该接收previewTitle和previewContent props', () => {
      const { container } = render(
        <FavoritesManager
          {...defaultProps}
          previewTitle="预览标题"
          previewContent="预览内容"
        />
      )
      
      expect(container).toBeInTheDocument()
    })
  })

  describe('回调函数props', () => {
    it('应该接收所有回调函数', () => {
      const callbacks = {
        onAddFavoriteInputChange: jest.fn(),
        onAddFavorite: jest.fn(),
        onCloseAddFavoriteModal: jest.fn(),
        onCloseFavoritesModal: jest.fn(),
        onPreviewFavorite: jest.fn(),
        onApplyFavorite: jest.fn(),
        onDeleteFavorite: jest.fn(),
        onClosePreviewModal: jest.fn()
      }
      
      const { container } = render(
        <FavoritesManager {...defaultProps} {...callbacks} />
      )
      
      expect(container).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理空的favoritesList', () => {
      const { container } = render(
        <FavoritesManager {...defaultProps} favoritesList={[]} />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该处理大量favorites', () => {
      const manyFavorites = Array.from({ length: 100 }, (_, i) => ({
        ...mockFavorite,
        id: `fav_${i}`,
        name: `收藏${i}`
      }))
      
      const { container } = render(
        <FavoritesManager {...defaultProps} favoritesList={manyFavorites} />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该处理空字符串的input值', () => {
      const { container } = render(
        <FavoritesManager {...defaultProps} favoriteNameInput="" />
      )
      
      expect(container).toBeInTheDocument()
    })

    it('应该处理空字符串的preview值', () => {
      const { container } = render(
        <FavoritesManager
          {...defaultProps}
          previewTitle=""
          previewContent=""
        />
      )
      
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
        <FavoritesManager
          {...defaultProps}
          favoriteNameInput="<script>alert('xss')</script>"
          previewTitle="测试@#$%"
          previewContent="中文🎉"
        />
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
      
      rerender(
        <FavoritesManager {...defaultProps} addFavoriteModalVisible={true} />
      )
      
      expect(getByTestId('add-favorite-modal')).toBeInTheDocument()
    })

    it('应该支持favoritesList更新', () => {
      const { rerender, container } = render(
        <FavoritesManager {...defaultProps} favoritesList={[]} />
      )
      
      expect(container).toBeInTheDocument()
      
      rerender(
        <FavoritesManager {...defaultProps} favoritesList={[mockFavorite]} />
      )
      
      expect(container).toBeInTheDocument()
    })
  })
})

