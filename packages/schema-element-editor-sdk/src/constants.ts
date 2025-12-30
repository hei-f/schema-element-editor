/**
 * Schema Element Editor Host SDK - Constants
 * 常量定义
 */

import type { PostMessageSourceConfig, PostMessageTypeConfig } from './types'

/** 默认消息标识 */
export const DEFAULT_SOURCE_CONFIG: PostMessageSourceConfig = {
  contentSource: 'schema-element-editor-content',
  hostSource: 'schema-element-editor-host',
} as const

/** SDK 协调消息源标识（用于 SDK 之间通信） */
export const SDK_COORDINATOR_SOURCE = 'schema-element-editor-sdk-coordinator'

/** 默认消息类型 */
export const DEFAULT_MESSAGE_TYPES: PostMessageTypeConfig = {
  getSchema: 'GET_SCHEMA',
  updateSchema: 'UPDATE_SCHEMA',
  checkPreview: 'CHECK_PREVIEW',
  renderPreview: 'RENDER_PREVIEW',
  cleanupPreview: 'CLEANUP_PREVIEW',
  // 录制模式相关
  startRecording: 'START_RECORDING',
  stopRecording: 'STOP_RECORDING',
  schemaPush: 'SCHEMA_PUSH',
} as const

/** SDK 协调消息类型 */
export const SDK_COORDINATION_MESSAGE_TYPES = {
  register: 'SDK_REGISTER',
  unregister: 'SDK_UNREGISTER',
  query: 'SDK_QUERY',
} as const
