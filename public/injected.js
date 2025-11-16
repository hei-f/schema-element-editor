;(function () {
  console.log('Schema Editor injected script已加载')

  const MESSAGE_SOURCE = {
    FROM_CONTENT: 'schema-editor-content',
    FROM_INJECTED: 'schema-editor-injected'
  }

  /** 函数名配置 */
  let functionNames = {
    get: '__getSchemaByParams',
    update: '__updateSchemaByParams'
  }

  /** 加载函数名配置 */
  chrome.storage.local.get(['getFunctionName', 'updateFunctionName'], (result) => {
    if (result.getFunctionName) {
      functionNames.get = result.getFunctionName
    }
    if (result.updateFunctionName) {
      functionNames.update = result.updateFunctionName
    }
    console.log('已加载函数名配置:', functionNames)
  })

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (!event.data || event.data.source !== MESSAGE_SOURCE.FROM_CONTENT) return

    const { type, payload } = event.data
    console.log('📥 injected script收到消息:', { type, payload })

    switch (type) {
      case 'GET_SCHEMA':
        handleGetSchema(payload)
        break
      case 'UPDATE_SCHEMA':
        handleUpdateSchema(payload)
        break
      default:
        console.warn('未知的消息类型:', type)
    }
  })

  function handleGetSchema(payload) {
    console.log('🔍 handleGetSchema 收到 payload:', payload)
    console.log('🔍 payload 类型:', typeof payload, payload)
    
    const { params } = payload || {}
    console.log('🔍 解构后:', { params })

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
      sendResponse('UPDATE_RESULT', {
        success: !!result,
        message: result ? '更新成功' : '更新失败'
      })
    } catch (error) {
      console.error('更新Schema失败:', error)
      sendResponse('UPDATE_RESULT', {
        success: false,
        error: error.message || '更新Schema时发生错误'
      })
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

