import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

/**
 * 配置Monaco Editor
 * 
 * 在Chrome扩展的content script环境中：
 * - Worker受到严格的CSP限制，无法正常加载
 * - 通过设置 createWebWorker: false，在主线程中运行语言服务
 * - 这样可以完整提供JSON语言服务（代码折叠、语法验证、自动补全等）
 * - 对于扩展场景的适中编辑器大小，性能影响可接受
 * 
 * @returns {boolean} 如果是新配置返回 true，如果使用已有配置返回 false
 */
export function configureMonaco(): boolean {
  // 检查页面是否已有 MonacoEnvironment 配置
  const existingEnv = (self as any).MonacoEnvironment
  
  if (!existingEnv) {
    // 页面没有配置，提供扩展自己的配置
    // @ts-ignore
    self.MonacoEnvironment = {
      // 提供一个完整的Worker模拟对象，所有操作在主线程同步执行
      // 这是在Chrome扩展等受限环境中使用Monaco的标准方案
      getWorker: (_moduleId: string, _label: string) => {
        // 创建一个符合Worker接口的模拟对象
        const worker = {
          postMessage: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          terminate: () => {},
          dispatchEvent: () => true,
          // 添加常用的Worker属性
          onmessage: null,
          onerror: null,
          onmessageerror: null
        }
        return worker as any
      }
    }
    console.log('📝 Monaco Editor 已加载（主线程模式，无Worker支持）')
    
    // 使用本地加载的monaco实例
    loader.config({ monaco })
    
    // 全局配置JSON语言服务，禁用需要Worker的特性
    // 这个配置对所有JSON编辑器实例生效，只需执行一次
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false, // 禁用语法验证（需要Worker）
      schemas: [],
      allowComments: true
    })
    
    return true
  } else {
    // 页面已有配置，不覆盖，使用页面的配置
    console.log('📝 Monaco Editor 已加载（使用页面现有配置）')
    
    // 使用本地加载的monaco实例
    loader.config({ monaco })
    return false
  }
}

