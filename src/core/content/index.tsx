import { logger } from '@/shared/utils/logger'
import { SchemaEditorContent } from './core/content-app'

logger.log('Schema Editor Content Script已加载')

// 启动Content Script
new SchemaEditorContent()
