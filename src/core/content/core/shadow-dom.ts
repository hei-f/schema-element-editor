import { logger } from '@/shared/utils/logger'
import ReactDOM from 'react-dom/client'

/**
 * 转换CSS中的资源路径为绝对路径
 */
const transformCSSPaths = (cssText: string): string => {
  return cssText.replace(/url\(['"]?([^'")]+)['"]?\)/g, (_match, path) => {
    // 如果已经是绝对路径或 data URI，跳过
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('chrome-extension:')) {
      return `url('${path}')`
    }
    
    const extensionOrigin = chrome.runtime.getURL('')
    
    // 如果是根路径（如 /assets/xxx），转换为 chrome-extension:// URL
    if (path.startsWith('/')) {
      return `url('${extensionOrigin}${path.substring(1)}')`
    }
    
    // 相对路径（如 ./xxx, ../xxx 或无前缀）
    // 假设这些资源都在 assets 目录下（Vite 构建后的标准输出）
    if (path.startsWith('./')) {
      return `url('${extensionOrigin}assets/${path.substring(2)}')`
    } else if (path.startsWith('../')) {
      // 向上一级，通常指向 dist 根目录
      return `url('${extensionOrigin}${path.substring(3)}')`
    } else {
      // 无前缀的相对路径
      return `url('${extensionOrigin}assets/${path}')`
    }
  })
}

/**
 * 使用fetch加载CSS文件内容并注入到Shadow DOM
 */
const loadAndInjectCSS = async (shadowRoot: ShadowRoot, url: string, sourceName: string): Promise<void> => {
  try {
    const response = await fetch(url)
    let cssText = await response.text()
    
    // 获取 CSS 文件所在目录的 base URL
    const baseURL = url.substring(0, url.lastIndexOf('/') + 1)
    
    // 替换所有 CSS 中的资源路径（字体、图片等）
    // 匹配所有 url(...) 中的路径
    cssText = cssText.replace(/url\(['"]?([^'")]+)['"]?\)/g, (_match, path) => {
      // 如果已经是绝对路径或 data URI，跳过
      if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('chrome-extension:')) {
        return `url('${path}')`
      }
      
      // 处理相对路径和绝对路径
      let absolutePath = ''
      if (path.startsWith('./')) {
        // 当前目录
        absolutePath = baseURL + path.substring(2)
      } else if (path.startsWith('../')) {
        // 父目录 - 需要递归向上查找
        let currentURL = baseURL
        let relativePath = path
        while (relativePath.startsWith('../')) {
          currentURL = currentURL.substring(0, currentURL.lastIndexOf('/', currentURL.length - 2) + 1)
          relativePath = relativePath.substring(3)
        }
        absolutePath = currentURL + relativePath
      } else if (path.startsWith('/')) {
        // 根路径（如 /assets/xxx），转换为 chrome-extension:// URL
        const extensionOrigin = chrome.runtime.getURL('')
        // 去掉开头的 /，因为 getURL 已经包含了 /
        absolutePath = extensionOrigin + path.substring(1)
      } else {
        // 无前缀的相对路径，视为当前目录
        absolutePath = baseURL + path
      }
      
      return `url('${absolutePath}')`
    })
    
    const styleElement = document.createElement('style')
    styleElement.textContent = cssText
    styleElement.setAttribute('data-source', sourceName)
    shadowRoot.appendChild(styleElement)
  } catch (error) {
    logger.error(`加载CSS失败: ${sourceName}`, error)
  }
}

/**
 * 加载所有必需的CSS到Shadow DOM
 */
const loadAllStyles = async (shadowRoot: ShadowRoot): Promise<void> => {
  // 1. 加载Ant Design CSS（从node_modules）
  await loadAndInjectCSS(
    shadowRoot,
    chrome.runtime.getURL('node_modules/antd/dist/reset.css'),
    'antd'
  )
  
  // 2. 复制页面中已注入的style标签（styled-components等），并转换路径
  const existingStyles = document.querySelectorAll('head > style')
  
  existingStyles.forEach((style) => {
    const clonedStyle = document.createElement('style')
    // 转换CSS路径
    clonedStyle.textContent = transformCSSPaths(style.textContent || '')
    clonedStyle.setAttribute('data-shadow-copied', 'true')
    shadowRoot.appendChild(clonedStyle)
  })
  
  // 3. 复制页面中通过link标签加载的CSS，并转换路径
  const existingLinks = document.querySelectorAll('head > link[rel="stylesheet"]')
  
  for (const link of existingLinks) {
    const href = (link as HTMLLinkElement).href
    if (href) {
      await loadAndInjectCSS(shadowRoot, href, `external-link: ${href}`)
    }
  }
  
  // 4. 监听后续动态添加的样式和link标签，并转换路径
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement) {
          const clonedStyle = document.createElement('style')
          // 转换CSS路径
          clonedStyle.textContent = transformCSSPaths(node.textContent || '')
          clonedStyle.setAttribute('data-shadow-copied', 'true')
          clonedStyle.setAttribute('data-dynamic', 'true')
          shadowRoot.appendChild(clonedStyle)
        } else if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
          // 动态添加的link标签
          const href = node.href
          if (href) {
            loadAndInjectCSS(shadowRoot, href, `dynamic-link: ${href}`).catch(error => {
              logger.error(`加载动态CSS失败: ${href}`, error)
            })
          }
        }
      })
    })
  })
  
  observer.observe(document.head, {
    childList: true,
    subtree: false
  })
}

/**
 * 创建Shadow DOM容器并挂载React应用
 */
export const createShadowRoot = async (): Promise<{ 
  container: HTMLDivElement
  root: ReactDOM.Root
  shadowRoot: ShadowRoot
}> => {
  // 创建容器
  const container = document.createElement('div')
  container.id = 'schema-editor-root'
  container.setAttribute('data-schema-editor-ui', 'true')
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2147483646;
    pointer-events: none;
  `
  document.body.appendChild(container)

  // 创建Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 加载所有CSS
  await loadAllStyles(shadowRoot)

  // 创建样式容器（用于styled-components注入）
  const styleContainer = document.createElement('div')
  styleContainer.id = 'style-container'
  styleContainer.style.cssText = `
    pointer-events: auto;
  `
  shadowRoot.appendChild(styleContainer)

  // 创建React根容器
  const reactContainer = document.createElement('div')
  reactContainer.id = 'react-root'
  styleContainer.appendChild(reactContainer)

  // 创建React Root
  const root = ReactDOM.createRoot(reactContainer)

  return { container, root, shadowRoot }
}

