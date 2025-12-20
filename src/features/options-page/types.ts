import type { SectionKey } from './config/field-config'
import type { StorageData } from '@/shared/types'

/**
 * Section 组件通用 Props
 * 所有配置区块组件共享此接口
 */
export interface SectionProps {
  /** 区块 ID，用于滚动定位 */
  sectionId?: string
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
  /** 主题色 */
  themeColor?: string
  /** 悬浮态颜色 */
  hoverColor?: string
  /** 激活态颜色 */
  activeColor?: string
}

/**
 * 设置数据结构
 * 用于从存储中加载的所有配置数据
 */
export interface SettingsData {
  /** 表单值（用于 form.setFieldsValue） */
  formValues: Record<string, unknown>
}

/**
 * 存储服务接口
 * 抽象存储操作，支持不同环境的实现
 */
export interface SettingsStorage {
  /**
   * 加载所有设置
   */
  loadAllSettings: () => Promise<SettingsData>

  /**
   * 保存单个字段
   * @param fieldPath 字段路径
   * @param allValues 所有表单值
   */
  saveField: (fieldPath: string[], allValues: Record<string, unknown>) => Promise<void>

  /**
   * 重置指定卡片到默认值
   * @param sectionKey 卡片标识
   * @returns 重置后的默认值
   */
  resetSectionToDefault: (sectionKey: SectionKey) => Promise<Record<string, unknown>>

  /**
   * 重置所有配置到默认值
   * @returns 重置后的默认值
   */
  resetAllToDefault: () => Promise<Record<string, unknown>>

  /**
   * 批量保存所有配置
   * @param allValues 所有配置值
   */
  setAllConfig: (allValues: StorageData) => Promise<void>
}

/**
 * 外部操作接口
 * 用于注入外部依赖的操作
 */
export interface ExternalActions {
  /**
   * 检查更新按钮点击回调
   * undefined 表示隐藏检查更新按钮
   */
  onCheckUpdate?: () => void

  /**
   * 是否设置 document.title
   * @default true
   */
  shouldSetDocumentTitle?: boolean

  /**
   * 是否为发布构建（控制 DebugSection 显示）
   * @default __IS_RELEASE_BUILD__
   */
  isReleaseBuild?: boolean
}

/**
 * OptionsPageContent 组件 Props
 */
export interface OptionsPageContentProps {
  /** 存储服务 */
  storage: SettingsStorage
  /** 外部操作 */
  actions?: ExternalActions
}
