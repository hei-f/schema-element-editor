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
    /** 是否限制向上搜索层级 */
    limitUpwardSearch: ['searchConfig', 'limitUpwardSearch'],
    /** 向上搜索深度 */
    searchDepthUp: ['searchConfig', 'searchDepthUp'],
    /** 节流间隔 */
    throttleInterval: ['searchConfig', 'throttleInterval'],
  },

  /** 获取函数名 */
  getFunctionName: ['getFunctionName'],

  /** 更新函数名 */
  updateFunctionName: ['updateFunctionName'],

  /** 预览函数名 */
  previewFunctionName: ['previewFunctionName'],

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
    /** 转义/去转义按钮 */
    escape: ['toolbarButtons', 'escape'],
    /** 解析按钮（原反序列化） */
    deserialize: ['toolbarButtons', 'deserialize'],
    /** 压缩按钮（原序列化） */
    serialize: ['toolbarButtons', 'serialize'],
    /** 格式化按钮 */
    format: ['toolbarButtons', 'format'],
    /** 预览按钮 */
    preview: ['toolbarButtons', 'preview'],
    /** 导入导出按钮 */
    importExport: ['toolbarButtons', 'importExport'],
    /** 草稿功能 */
    draft: ['toolbarButtons', 'draft'],
    /** 收藏功能 */
    favorites: ['toolbarButtons', 'favorites'],
    /** 历史记录功能 */
    history: ['toolbarButtons', 'history'],
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
    /** 自动更新预览 */
    autoUpdate: ['previewConfig', 'autoUpdate'],
    /** z-index 配置 */
    zIndex: {
      /** 默认状态 z-index */
      default: ['previewConfig', 'zIndex', 'default'],
      /** 预览模式 z-index */
      preview: ['previewConfig', 'zIndex', 'preview'],
    },
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
    maxHighlightCount: ['highlightAllConfig', 'maxHighlightCount'],
  },

  /** 录制模式配置 */
  recordingModeConfig: {
    /** 是否启用 */
    enabled: ['recordingModeConfig', 'enabled'],
    /** 快捷键 */
    keyBinding: ['recordingModeConfig', 'keyBinding'],
    /** 录制模式高亮颜色 */
    highlightColor: ['recordingModeConfig', 'highlightColor'],
    /** 轮询间隔 */
    pollingInterval: ['recordingModeConfig', 'pollingInterval'],
    /** 自动停止超时时间 */
    autoStopTimeout: ['recordingModeConfig', 'autoStopTimeout'],
  },

  /** iframe 支持配置 */
  iframeConfig: {
    /** 是否启用 */
    enabled: ['iframeConfig', 'enabled'],
    /** Schema 数据来源 */
    schemaTarget: ['iframeConfig', 'schemaTarget'],
  },

  /** 启用 AST 类型提示 */
  enableAstTypeHints: ['enableAstTypeHints'],

  /** 导出配置 */
  exportConfig: {
    /** 导出时自定义文件名 */
    customFileName: ['exportConfig', 'customFileName'],
  },

  /** API 配置 */
  apiConfig: {
    /** 通信模式 */
    communicationMode: ['apiConfig', 'communicationMode'],
    /** 请求超时时间 */
    requestTimeout: ['apiConfig', 'requestTimeout'],
    /** 消息标识配置 */
    sourceConfig: {
      /** 插件端 source */
      contentSource: ['apiConfig', 'sourceConfig', 'contentSource'],
      /** 宿主端 source */
      hostSource: ['apiConfig', 'sourceConfig', 'hostSource'],
    },
    /** 消息类型名称配置 */
    messageTypes: {
      /** 获取 Schema */
      getSchema: ['apiConfig', 'messageTypes', 'getSchema'],
      /** 更新 Schema */
      updateSchema: ['apiConfig', 'messageTypes', 'updateSchema'],
      /** 检查预览 */
      checkPreview: ['apiConfig', 'messageTypes', 'checkPreview'],
      /** 渲染预览 */
      renderPreview: ['apiConfig', 'messageTypes', 'renderPreview'],
      /** 清理预览 */
      cleanupPreview: ['apiConfig', 'messageTypes', 'cleanupPreview'],
    },
  },

  /** 抽屉快捷键配置 */
  drawerShortcuts: {
    /** 保存快捷键 */
    save: ['drawerShortcuts', 'save'],
    /** 格式化快捷键 */
    format: ['drawerShortcuts', 'format'],
    /** 打开/更新预览快捷键 */
    openOrUpdatePreview: ['drawerShortcuts', 'openOrUpdatePreview'],
    /** 关闭预览快捷键 */
    closePreview: ['drawerShortcuts', 'closePreview'],
  },

  /** 主题色 */
  themeColor: ['themeColor'],
}

/**
 * 表单路径类型
 * 从 FORM_PATHS 中提取所有路径的联合类型
 */
export type FormPath = (typeof FORM_PATHS)[keyof typeof FORM_PATHS]
