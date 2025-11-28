import type { ThemeConfig } from 'antd'

/**
 * Shadow DOM 环境专用的 Ant Design 主题配置
 *
 * 目的：
 * 1. 防止外部页面的 Ant Design token 通过 CSS 变量穿透 Shadow DOM
 * 2. 确保插件组件样式的独立性和一致性
 *
 * 原理：
 * - CSS 变量（CSS Custom Properties）可以穿透 Shadow DOM 边界
 * - Ant Design 5 使用 Design Token 系统，token 会转换为 CSS 变量（如 --ant-*）
 * - 在 ConfigProvider 中显式设置 theme，会在其作用域内生成新的 CSS 变量
 * - 这些新变量会覆盖从外部继承的同名变量，实现样式隔离
 *
 * Token 设置策略：
 * ✅ 必须设置：容易被外部自定义的核心 token（颜色、文本、边框等）
 * ⚠️  推荐设置：影响布局的 token（尺寸、间距等）
 * ❌ 无需设置：派生 token（会自动计算）和不常用 token
 *
 * 注意：只有显式设置的 token 才会生成新的 CSS 变量来覆盖外部变量！
 *
 * 使用场景：
 * - Chrome 扩展的 content script 注入的 UI
 * - 任何需要在第三方页面中保持独立样式的场景
 */
export const shadowDomTheme: ThemeConfig = {
  token: {
    // ============================================
    // 🎨 颜色系统（必须设置）
    // 最容易被外部页面自定义的 token，必须显式设置以防污染
    // ============================================
    colorPrimary: '#1890ff', // 主色调
    colorSuccess: '#52c41a', // 成功色
    colorWarning: '#faad14', // 警告色
    colorError: '#ff4d4f', // 错误色
    colorInfo: '#1890ff', // 信息色

    // 派生颜色（如 colorPrimaryHover）无需设置，会自动从 colorPrimary 计算

    // ============================================
    // 📝 文本颜色（必须设置）
    // 影响所有文本的可读性，外部页面经常修改
    // ============================================
    colorText: 'rgba(0, 0, 0, 0.88)', // 一级文本
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)', // 二级文本
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)', // 三级文本
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)', // 四级文本

    // ============================================
    // 🖼️ 边框与背景（必须设置）
    // 定义组件的视觉边界，常被自定义
    // ============================================
    colorBorder: '#d9d9d9', // 默认边框色
    colorBorderSecondary: '#f0f0f0', // 二级边框色

    colorBgContainer: '#ffffff', // 组件容器背景
    colorBgElevated: '#ffffff', // 浮层背景（如 Modal、Dropdown）
    colorBgLayout: '#f5f5f5', // 布局背景
    colorBgSpotlight: 'rgba(0, 0, 0, 0.85)', // 遮罩背景

    // ============================================
    // 📐 尺寸系统（推荐设置）
    // 保证布局的一致性，避免因外部尺寸变化导致布局错乱
    // ============================================

    // 圆角
    borderRadius: 6, // 基础圆角（Button、Input 等）

    // 字体
    fontSize: 14, // 基础字号
    fontSizeSM: 12, // 小号字体
    fontSizeLG: 16, // 大号字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',

    // 行高
    lineHeight: 1.5715, // 基础行高
    lineHeightLG: 1.5, // 大号行高
    lineHeightSM: 1.66, // 小号行高

    // 控件高度
    controlHeight: 32, // 默认控件高度（Button、Input）
    controlHeightLG: 40, // 大号控件
    controlHeightSM: 24, // 小号控件

    // ============================================
    // 🎭 视觉效果（可选设置）
    // 较少被修改，但设置后可确保视觉一致性
    // ============================================

    // 阴影
    boxShadow:
      '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // 运动（动画）
    motionUnit: 0.1, // 动画单元
    motionBase: 0, // 动画基数
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',

    // ============================================
    // 🔗 交互颜色（推荐设置）
    // 链接等交互元素的颜色
    // ============================================
    colorLink: '#1890ff', // 链接色
    colorLinkHover: '#40a9ff', // 链接悬浮色
    colorLinkActive: '#096dd9', // 链接激活色

    // ============================================
    // 📊 层级系统（推荐设置）
    // 控制弹层的 z-index，避免层级错乱
    // ============================================
    zIndexBase: 0, // 基础层级
    zIndexPopupBase: 1000, // 弹层基础层级

    // ============================================
    // 💡 说明
    // ============================================
    //
    // 未设置的 token 说明：
    // 1. 派生 token：如 colorPrimaryBg、colorErrorBg 等会自动从基础色计算
    // 2. 间距系统：marginXS/SM/LG 等，使用 Ant Design 默认算法
    // 3. 不常用 token：如 wireframe、opacityImage 等
    //
    // 如何判断是否需要添加更多 token：
    // 1. 在测试中发现某个样式被外部污染
    // 2. 检查该样式对应的 token 名称
    // 3. 在此处添加该 token 的默认值
    //
    // 查看完整 token 列表：
    // https://ant.design/docs/react/customize-theme-cn#seedtoken
  },

  // 组件级别的样式配置
  components: {
    // Drawer 组件配置
    Drawer: {
      // 使用默认配置，如有需要可在此自定义
    },

    // Button 组件配置
    Button: {
      // 使用默认配置
    },

    // Message 组件配置
    Message: {
      // 使用默认配置
      // 注意：zIndex 通过 token.zIndexPopupBase 控制
    },

    // Modal 组件配置
    Modal: {
      // 使用默认配置
    },

    // Tooltip 组件配置
    Tooltip: {
      // 使用默认配置
    },
  },
}

/**
 * 导出配置说明
 *
 * 在 ContentApp 中使用：
 * ```tsx
 * import { shadowDomTheme } from '@/shared/constants/theme'
 *
 * <ConfigProvider theme={shadowDomTheme}>
 *   // 组件树
 * </ConfigProvider>
 * ```
 *
 * 效果：
 * - Shadow DOM 内部的所有 Ant Design 组件将使用这里定义的 token
 * - 外部页面的 CSS 变量不会影响内部组件样式
 * - 保持插件 UI 的视觉一致性
 */
