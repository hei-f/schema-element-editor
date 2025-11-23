/**
 * 表单字段路径常量
 * 提供类型安全的字段路径，避免魔法字符串
 * 结构镜像 DEFAULT_VALUES，确保与数据结构一致
 */

/**
 * 表单字段路径常量对象
 * 使用 as const 确保类型推导为字面量类型，提供完整的类型安全
 * 
 * @example
 * // ✅ 类型安全的使用方式
 * <Form.Item name={FORM_PATHS.searchConfig.searchDepthDown}>
 * 
 * // ✅ IDE 自动补全
 * FORM_PATHS.searchConfig. // 按下 . 后会列出所有子字段
 * 
 * // ❌ TypeScript 会报错
 * FORM_PATHS.searchConfig.wrongField // 属性不存在
 */
export const FORM_PATHS = {
  /** 属性名称 */
  attributeName: ['attributeName'],
  
  /** 抽屉宽度 */
  drawerWidth: ['drawerWidth'],
  
  /** 搜索配置 */
  searchConfig: {
    /** 向下搜索深度 */
    searchDepthDown: ['searchConfig', 'searchDepthDown'],
    /** 向上搜索深度 */
    searchDepthUp: ['searchConfig', 'searchDepthUp'],
    /** 节流间隔 */
    throttleInterval: ['searchConfig', 'throttleInterval']
  },
  
  /** 获取函数名 */
  getFunctionName: ['getFunctionName'],
  
  /** 更新函数名 */
  updateFunctionName: ['updateFunctionName'],
  
  /** 自动解析字符串 */
  autoParseString: ['autoParseString'],
  
  /** 启用调试日志 */
  enableDebugLog: ['enableDebugLog'],
  
  /** 高亮颜色 */
  highlightColor: ['highlightColor'],
  
  /** 工具栏按钮配置 */
  toolbarButtons: {
    /** AST/RawString切换按钮 */
    astRawStringToggle: ['toolbarButtons', 'astRawStringToggle'],
    /** 反序列化按钮 */
    deserialize: ['toolbarButtons', 'deserialize'],
    /** 序列化按钮 */
    serialize: ['toolbarButtons', 'serialize'],
    /** 格式化按钮 */
    format: ['toolbarButtons', 'format'],
    /** 预览按钮 */
    preview: ['toolbarButtons', 'preview']
  },
  
  /** 最大收藏数量 */
  maxFavoritesCount: ['maxFavoritesCount'],
  
  /** 自动保存草稿 */
  autoSaveDraft: ['autoSaveDraft'],
  
  /** 预览配置 */
  previewConfig: {
    /** 预览区域宽度 */
    previewWidth: ['previewConfig', 'previewWidth'],
    /** 更新延迟 */
    updateDelay: ['previewConfig', 'updateDelay'],
    /** 记住预览状态 */
    rememberState: ['previewConfig', 'rememberState'],
    /** 自动更新预览 */
    autoUpdate: ['previewConfig', 'autoUpdate']
  },
  
  /** 最大历史记录数量 */
  maxHistoryCount: ['maxHistoryCount'],
  
  /** 高亮所有元素配置 */
  highlightAllConfig: {
    /** 是否启用 */
    enabled: ['highlightAllConfig', 'enabled'],
    /** 快捷键 */
    keyBinding: ['highlightAllConfig', 'keyBinding'],
    /** 最大高亮数量 */
    maxHighlightCount: ['highlightAllConfig', 'maxHighlightCount']
  },
  
  /** 启用 AST 类型提示 */
  enableAstTypeHints: ['enableAstTypeHints']
}

/**
 * 表单路径类型
 * 从 FORM_PATHS 中提取所有路径的联合类型
 */
export type FormPath = typeof FORM_PATHS[keyof typeof FORM_PATHS]

