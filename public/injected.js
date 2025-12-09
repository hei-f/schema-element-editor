;(function () {
  /**
   * Injected Script - 仅 windowFunction 模式使用
   *
   * 此脚本运行在页面上下文中，用于调用宿主应用暴露的 window 函数
   * postMessage 模式不需要此脚本，Content Script 直接与宿主通信
   */

  // 检测是否已经注入，避免重复注入
  if (window.__SCHEMA_ELEMENT_EDITOR_INJECTED__) {
    return
  }

  // 设置全局标记
  window.__SCHEMA_ELEMENT_EDITOR_INJECTED__ = true

  const MESSAGE_SOURCE = {
    FROM_CONTENT: 'schema-element-editor-content',
    FROM_INJECTED: 'schema-element-editor-injected',
  }

  /**
   * 函数名配置（windowFunction 模式）
   */
  let functionNames = {
    get: '__getContentById',
    update: '__updateContentById',
  }

  /**
   * 预览函数名（windowFunction 模式）
   */
  let previewFunctionName = '__getContentPreview'

  /**
   * 监听来自 Content Script 的消息
   */
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
      default:
        // 忽略未知消息类型
        break
    }
  })

  /**
   * 处理配置同步
   */
  function handleConfigSync(payload) {
    const {
      getFunctionName,
      updateFunctionName,
      previewFunctionName: previewFnName,
    } = payload || {}

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

  /**
   * 获取 Schema（调用 window 函数）
   */
  function handleGetSchema(payload) {
    const { params } = payload || {}

    try {
      const getFn = window[functionNames.get]
      if (typeof getFn !== 'function') {
        sendResponse('SCHEMA_RESPONSE', {
          success: false,
          error: `页面未提供 ${functionNames.get} 方法`,
        })
        return
      }

      const schema = getFn(params)
      sendResponse('SCHEMA_RESPONSE', {
        success: true,
        data: schema,
      })
    } catch (error) {
      console.error('获取Schema失败:', error)
      sendResponse('SCHEMA_RESPONSE', {
        success: false,
        error: error.message || '获取Schema时发生错误',
      })
    }
  }

  /**
   * 更新 Schema（调用 window 函数）
   */
  function handleUpdateSchema(payload) {
    const { schema, params } = payload || {}

    try {
      const updateFn = window[functionNames.update]
      if (typeof updateFn !== 'function') {
        sendResponse('UPDATE_RESULT', {
          success: false,
          error: `页面未提供 ${functionNames.update} 方法`,
        })
        return
      }

      const result = updateFn(schema, params)
      const success = result !== false
      sendResponse('UPDATE_RESULT', {
        success,
        message: success ? '更新成功' : '更新失败',
      })
    } catch (error) {
      console.error('更新Schema失败:', error)
      sendResponse('UPDATE_RESULT', {
        success: false,
        error: error.message || '更新Schema时发生错误',
      })
    }
  }

  /**
   * 检查预览函数是否存在
   */
  function handleCheckPreviewFunction() {
    const previewFn = window[previewFunctionName]
    sendResponse('PREVIEW_FUNCTION_RESULT', {
      exists: typeof previewFn === 'function',
    })
  }

  /** 用户返回的清理函数 */
  let userCleanupFn = null

  /**
   * 渲染预览（调用 window 函数）
   * 统一传递 containerId，与 postMessage 模式一致
   */
  function handleRenderPreview(payload) {
    const { schema, containerId } = payload || {}

    try {
      const previewFn = window[previewFunctionName]
      if (typeof previewFn !== 'function') {
        return
      }

      // 验证容器存在
      if (!document.getElementById(containerId)) {
        console.error('预览容器不存在:', containerId)
        return
      }

      // 统一传递 containerId，宿主自行获取容器
      const result = previewFn(schema, containerId)

      // 如果返回清理函数，保存下来
      if (typeof result === 'function') {
        userCleanupFn = result
      }
    } catch (error) {
      console.error('渲染预览失败:', error)
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = `
          <div style="color: red; padding: 20px;">
            <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
            <div style="font-size: 12px;">${error.message || '未知错误'}</div>
          </div>
        `
      }
    }
  }

  /**
   * 清除预览
   */
  function handleClearPreview() {
    try {
      // 调用用户返回的清理函数
      if (userCleanupFn) {
        try {
          userCleanupFn()
        } catch (e) {
          console.warn('执行用户清理函数失败:', e)
        }
        userCleanupFn = null
      }
    } catch (error) {
      console.error('清除预览失败:', error)
    }
  }

  /**
   * 发送响应到 Content Script
   */
  function sendResponse(type, payload) {
    window.postMessage(
      {
        source: MESSAGE_SOURCE.FROM_INJECTED,
        type,
        payload,
      },
      '*'
    )
  }

  // 通知 Content Script 注入完成
  sendResponse('INJECTED_READY', { ready: true })
})()
