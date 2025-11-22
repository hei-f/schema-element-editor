import ReactDOM from 'react-dom/client'

/**
 * 使用fetch加载CSS文件内容并注入到Shadow DOM
 */
const loadAndInjectCSS = async (shadowRoot: ShadowRoot, url: string, sourceName: string): Promise<void> => {
  try {
    const response = await fetch(url)
    const cssText = await response.text()
    
    const styleElement = document.createElement('style')
    styleElement.textContent = cssText
    styleElement.setAttribute('data-source', sourceName)
    shadowRoot.appendChild(styleElement)
    
    console.log(`✅ 已加载CSS: ${sourceName}`)
  } catch (error) {
    console.error(`❌ 加载CSS失败: ${sourceName}`, error)
  }
}

/**
 * 加载所有必需的CSS到Shadow DOM
 */
const loadAllStyles = async (shadowRoot: ShadowRoot): Promise<void> => {
  console.log('🔍 开始加载所有CSS...')
  
  // 1. 加载Monaco Editor CSS（从node_modules）
  await loadAndInjectCSS(
    shadowRoot,
    chrome.runtime.getURL('node_modules/monaco-editor/min/vs/editor/editor.main.css'),
    'monaco-editor'
  )
  
  // 2. 加载Ant Design CSS（从node_modules）
  await loadAndInjectCSS(
    shadowRoot,
    chrome.runtime.getURL('node_modules/antd/dist/reset.css'),
    'antd'
  )
  
  // 3. 复制页面中已注入的style标签（styled-components等）
  const existingStyles = document.querySelectorAll('head > style')
  console.log(`📊 找到 ${existingStyles.length} 个现有style标签`)
  
  existingStyles.forEach((style) => {
    const clonedStyle = style.cloneNode(true) as HTMLStyleElement
    clonedStyle.setAttribute('data-shadow-copied', 'true')
    shadowRoot.appendChild(clonedStyle)
  })
  
  // 4. 监听后续动态添加的样式
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement) {
          const clonedStyle = node.cloneNode(true) as HTMLStyleElement
          clonedStyle.setAttribute('data-shadow-copied', 'true')
          clonedStyle.setAttribute('data-dynamic', 'true')
          shadowRoot.appendChild(clonedStyle)
          console.log(`✅ 已复制动态样式`)
        }
      })
    })
  })
  
  observer.observe(document.head, {
    childList: true,
    subtree: false
  })
  
  console.log('✅ 所有CSS加载完成')
}

/**
 * 创建Shadow DOM容器并挂载React应用
 */
export const createShadowRoot = async (): Promise<{ 
  container: HTMLDivElement
  root: ReactDOM.Root
  shadowRoot: ShadowRoot
}> => {
  console.log('🚀 开始创建Shadow DOM...')
  
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
  console.log('✅ Shadow DOM已创建')

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
  console.log('✅ React Root已创建')

  return { container, root, shadowRoot }
}

