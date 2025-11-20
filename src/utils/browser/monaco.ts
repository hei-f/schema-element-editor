import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

/**
 * 配置Monaco Editor
 * 
 * 在Chrome扩展环境中：
 * - 使用 Vite 的 ?worker 语法导入 Worker 文件，绕过 CSP 限制
 * - 为 JSON 语言提供完整的语言服务（包括代码折叠、语法验证等）
 * - 所有 Worker 相关错误由 MonacoErrorBoundary 拦截和处理
 * 
 * @returns {boolean} 如果是新配置返回 true，如果使用已有配置返回 false
 */
export function configureMonaco(): boolean {
  // 检查页面是否已有 MonacoEnvironment 配置
  const existingEnv = (self as any).MonacoEnvironment
  
  if (!existingEnv) {
    // 页面没有配置，提供扩展自己的 Worker 配置
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker(_: any, label: string) {
        // 根据语言类型返回对应的 Worker
        if (label === 'json') {
          return new jsonWorker()
        }
        return new editorWorker()
      }
    }
    console.log('📝 Monaco Editor 已加载（使用 Worker 支持）')
    
    // 使用本地加载的monaco实例
    loader.config({ monaco })
    return true
  } else {
    // 页面已有配置，不覆盖，使用页面的配置
    console.log('📝 Monaco Editor 已加载（使用页面现有配置）')
    
    // 使用本地加载的monaco实例
    loader.config({ monaco })
    return false
  }
}

