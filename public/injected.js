;(function () {
  // 检测是否已经注入，避免重复注入
  if (window.__SCHEMA_EDITOR_INJECTED__) {
    return
  }
  
  // 设置全局标记
  window.__SCHEMA_EDITOR_INJECTED__ = true

  const MESSAGE_SOURCE = {
    FROM_CONTENT: 'schema-editor-content',
    FROM_INJECTED: 'schema-editor-injected'
  }

  /** 函数名配置 */
  let functionNames = {
    get: '__getContentById',
    update: '__updateContentById'
  }

  /** 预览函数名 */
  let previewFunctionName = '__getContentPreview'

  /** 预览容器和 React root */
  let previewContainer = null
  let previewRoot = null
  /** 用户返回的清理函数 */
  let userCleanupFn = null

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (!event.data || event.data.source !== MESSAGE_SOURCE.FROM_CONTENT) return

    const { type, payload } = event.data

    switch (type) {
      case 'CONFIG_SYNC':
        handleConfigSync(payload)
        break
      case 'GET_SCHEMA':
        handleGetSchema(payload)
        break
      case 'UPDATE_SCHEMA':
        handleUpdateSchema(payload)
        break
      case 'CHECK_PREVIEW_FUNCTION':
        handleCheckPreviewFunction()
        break
      case 'RENDER_PREVIEW':
        handleRenderPreview(payload)
        break
      case 'CLEAR_PREVIEW':
        handleClearPreview()
        break
      case 'HIDE_PREVIEW':
        handleHidePreview()
        break
      case 'SHOW_PREVIEW':
        handleShowPreview()
        break
      default:
        console.warn('未知的消息类型:', type)
    }
  })

  function handleConfigSync(payload) {
    const { getFunctionName, updateFunctionName, previewFunctionName: previewFnName } = payload || {}
    
    if (getFunctionName) {
      functionNames.get = getFunctionName
    }
    if (updateFunctionName) {
      functionNames.update = updateFunctionName
    }
    if (previewFnName) {
      previewFunctionName = previewFnName
    }
  }

  function handleGetSchema(payload) {
    const { params } = payload || {}

    try {
      const getFn = window[functionNames.get]
      if (typeof getFn !== 'function') {
        sendResponse('SCHEMA_RESPONSE', {
          success: false,
          error: `页面未提供${functionNames.get}方法`
        })
        return
      }

      const schema = getFn(params)
      sendResponse('SCHEMA_RESPONSE', {
        success: true,
        data: schema
      })
    } catch (error) {
      console.error('获取Schema失败:', error)
      sendResponse('SCHEMA_RESPONSE', {
        success: false,
        error: error.message || '获取Schema时发生错误'
      })
    }
  }

  function handleUpdateSchema(payload) {
    const { schema, params } = payload || {}

    try {
      const updateFn = window[functionNames.update]
      if (typeof updateFn !== 'function') {
        sendResponse('UPDATE_RESULT', {
          success: false,
          error: `页面未提供${functionNames.update}方法`
        })
        return
      }

      const result = updateFn(schema, params)
      // 只要没抛异常就认为成功（除非明确返回 false）
      const success = result !== false
      sendResponse('UPDATE_RESULT', {
        success,
        message: success ? '更新成功' : '更新失败'
      })
    } catch (error) {
      console.error('更新Schema失败:', error)
      sendResponse('UPDATE_RESULT', {
        success: false,
        error: error.message || '更新Schema时发生错误'
      })
    }
  }

  /**
   * 检查预览函数是否存在
   */
  function handleCheckPreviewFunction() {
    const previewFn = window[previewFunctionName]
    sendResponse('PREVIEW_FUNCTION_RESULT', {
      exists: typeof previewFn === 'function'
    })
  }

  /**
   * 渲染预览内容
   */
  function handleRenderPreview(payload) {
    const { data, position } = payload || {}

    try {
      const previewFn = window[previewFunctionName]
      if (typeof previewFn !== 'function') {
        return
      }

      // 创建或更新预览容器
      if (!previewContainer) {
        createPreviewContainer(position)
      } else {
        updatePreviewPosition(position)
      }

      // 渲染预览内容
      renderPreviewContent(data, previewFn)
    } catch (error) {
      console.error('渲染预览失败:', error)
    }
  }

  /**
   * 创建预览容器
   */
  function createPreviewContainer(position) {
    // 创建容器元素
    previewContainer = document.createElement('div')
    previewContainer.id = 'schema-editor-preview-container'
    previewContainer.style.cssText = `
      position: fixed;
      left: ${position.left}px;
      top: ${position.top}px;
      width: ${position.width}px;
      height: ${position.height}px;
      z-index: 2147483646;
      background: #f5f5f5;
      border-right: 1px solid #e8e8e8;
      overflow: auto;
      padding: 16px;
      box-sizing: border-box;
    `
    
    document.body.appendChild(previewContainer)
  }

  /**
   * 更新预览容器位置
   */
  function updatePreviewPosition(position) {
    if (!previewContainer) return
    
    previewContainer.style.left = `${position.left}px`
    previewContainer.style.top = `${position.top}px`
    previewContainer.style.width = `${position.width}px`
    previewContainer.style.height = `${position.height}px`
  }

  /**
   * 渲染预览内容
   * @param {any} data - 预览数据
   * @param {Function} [previewFn] - 预览函数（可选，默认使用配置的函数）
   */
  function renderPreviewContent(data, previewFn) {
    if (!previewContainer) return
    
    try {
      const fn = previewFn || window[previewFunctionName]
      if (typeof fn !== 'function') {
        console.error('预览函数不存在')
        return
      }
      
      // 调用预览函数，传入 container 让用户可以自己管理渲染
      const result = fn(data, previewContainer)
      
      // 如果返回函数，说明用户自己处理了渲染，保存清理函数（仅首次保存或更新）
      if (typeof result === 'function') {
        userCleanupFn = result
        return
      }
      
      // 如果返回 null/undefined，说明用户自己处理了渲染但没有清理函数
      if (result === null || result === undefined) {
        return
      }
      
      // 向后兼容：如果返回的是 ReactNode，使用 ReactDOM 渲染
      const reactNode = result
      
      // 检查是否有 ReactDOM
      if (window.ReactDOM) {
        // React 18+ API：复用 root，只在首次创建
        if (window.ReactDOM.createRoot) {
          if (!previewRoot) {
            previewRoot = window.ReactDOM.createRoot(previewContainer)
          }
          previewRoot.render(reactNode)
        } 
        // React 17- API
        else if (window.ReactDOM.render) {
          window.ReactDOM.render(reactNode, previewContainer)
        }
      } else {
        // 如果没有 ReactDOM，直接设置 innerHTML（不推荐，但作为后备方案）
        console.warn('ReactDOM 不可用，尝试直接设置 HTML')
        if (typeof reactNode === 'string') {
          previewContainer.innerHTML = reactNode
        } else {
          previewContainer.innerHTML = '<div style="color: #999;">无法渲染预览内容（ReactDOM 不可用）</div>'
        }
      }
    } catch (error) {
      console.error('渲染预览内容失败:', error)
      previewContainer.innerHTML = `
        <div style="color: red; padding: 20px;">
          <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
          <div style="font-size: 12px;">${error.message || '未知错误'}</div>
        </div>
      `
    }
  }

  /**
   * 隐藏预览容器（拖拽时使用）
   */
  function handleHidePreview() {
    if (previewContainer) {
      previewContainer.style.display = 'none'
    }
  }

  /**
   * 显示预览容器（拖拽结束后使用）
   */
  function handleShowPreview() {
    if (previewContainer) {
      previewContainer.style.display = 'block'
    }
  }

  /**
   * 清除预览
   */
  function handleClearPreview() {
    try {
      // 调用用户返回的清理函数
      if (userCleanupFn && typeof userCleanupFn === 'function') {
        try {
          userCleanupFn()
        } catch (e) {
          console.warn('执行用户清理函数失败:', e)
        }
        userCleanupFn = null
      }
      
      // 清理 React root
      if (previewRoot) {
        if (previewRoot.unmount) {
          previewRoot.unmount()
        } else if (previewRoot._internalRoot) {
          // React 17- 的清理方式
          window.ReactDOM.unmountComponentAtNode(previewContainer)
        }
        previewRoot = null
      }
      
      // 移除容器
      if (previewContainer && previewContainer.parentNode) {
        previewContainer.parentNode.removeChild(previewContainer)
      }
      previewContainer = null
    } catch (error) {
      console.error('清除预览失败:', error)
    }
  }

  function sendResponse(type, payload) {
    window.postMessage(
      {
        source: MESSAGE_SOURCE.FROM_INJECTED,
        type,
        payload
      },
      '*'
    )
  }

  sendResponse('INJECTED_READY', { ready: true })
})()

