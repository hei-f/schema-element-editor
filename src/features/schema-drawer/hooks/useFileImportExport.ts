import type { ExportMetadata } from '../types/export'
import { buildExportData, detectFileFormat, generateExportFileName, validateFileSize } from '../utils/file-helpers'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Modal, message } from 'antd'
import React, { useCallback } from 'react'

interface UseFileImportExportProps {
  /** 当前编辑器内容 */
  editorValue: string
  
  /** 参数键 */
  paramsKey: string
  
  /** 原始数据类型标记 */
  wasStringData: boolean
  
  /** 是否可以解析（JSON 格式正确） */
  canParse: boolean
  
  /** 是否自定义文件名 */
  customFileName: boolean
  
  /** 加载成功回调 */
  onImportSuccess: (content: string, metadata?: ExportMetadata) => void
  
  /** 轻量提示函数 */
  showLightNotification: (message: string) => void
}

interface UseFileImportExportReturn {
  /** 导出处理函数 */
  handleExport: () => void
  
  /** 导入处理函数（用于 Upload beforeUpload） */
  handleImport: (file: File) => false
}

/**
 * 文件导入导出 Hook
 * 
 * 功能：
 * - 导出：将当前内容保存为带元数据的 JSON 文件
 * - 导入：从文件加载内容，智能识别格式
 */
export const useFileImportExport = ({
  editorValue,
  paramsKey,
  wasStringData,
  canParse,
  customFileName,
  onImportSuccess,
  showLightNotification
}: UseFileImportExportProps): UseFileImportExportReturn => {
  
  /**
   * 执行导出的核心逻辑
   */
  const performExport = useCallback((fileName: string) => {
    try {
      // 解析当前内容
      const parsed = JSON.parse(editorValue)
      
      // 构建元数据
      const metadata: ExportMetadata = {
        params: paramsKey,
        exportedAt: new Date().toISOString(),
        version: chrome.runtime.getManifest().version,
        wasStringData,
        url: window.location.href
      }
      
      // 构建导出数据
      const exportData = buildExportData(parsed, metadata)
      
      // 创建 Blob
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: 'application/json' }
      )
      
      // 确保文件名有 .json 扩展名
      const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`
      
      // 触发下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = finalFileName
      a.click()
      
      // 清理
      setTimeout(() => URL.revokeObjectURL(url), 100)
      
      showLightNotification('✅ 已导出到文件')
      logger.log('Export successful:', { fileName: finalFileName, size: blob.size })
    } catch (error) {
      message.error('导出失败：数据处理错误')
      logger.error('Export failed:', error)
    }
  }, [editorValue, paramsKey, wasStringData, showLightNotification])
  
  /**
   * 导出当前内容为 JSON 文件
   */
  const handleExport = useCallback(() => {
    if (!canParse) {
      message.error('导出失败：JSON 格式错误')
      return
    }
    
    // 如果启用了自定义文件名
    if (customFileName) {
      const defaultFileName = generateExportFileName(paramsKey).replace('.json', '')
      let inputValue = defaultFileName
      
      // 使用 React.createElement 创建表单内容
      const content = React.createElement(
        'div',
        { style: { marginTop: 16 } },
        React.createElement(
          'div',
          { style: { marginBottom: 8, color: '#666' } },
          '请输入文件名：'
        ),
        React.createElement('input', {
          type: 'text',
          defaultValue: defaultFileName,
          placeholder: '请输入文件名',
          style: {
            width: '100%',
            padding: '4px 11px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            fontSize: '14px'
          },
          onChange: (e: any) => {
            inputValue = e.target.value
          },
          onKeyDown: (e: any) => {
            if (e.key === 'Enter') {
              const fileName = inputValue.trim()
              if (fileName) {
                Modal.destroyAll()
                performExport(fileName)
              } else {
                message.warning('文件名不能为空')
              }
            }
          }
        }),
        React.createElement(
          'div',
          { style: { marginTop: 8, fontSize: 12, color: '#999' } },
          '提示：无需输入 .json 扩展名，系统会自动添加'
        )
      )
      
      Modal.confirm({
        title: '导出文件',
        content,
        okText: '导出',
        cancelText: '取消',
        getContainer: shadowRootManager.getContainer,
        onOk: () => {
          const fileName = inputValue.trim()
          if (fileName) {
            performExport(fileName)
          } else {
            message.warning('文件名不能为空')
            return Promise.reject()
          }
        }
      })
    } else {
      // 直接导出，使用默认文件名
      const fileName = generateExportFileName(paramsKey).replace('.json', '')
      performExport(fileName)
    }
  }, [canParse, customFileName, paramsKey, performExport])
  
  /**
   * 导入 JSON 文件
   */
  const handleImport = useCallback((file: File): false => {
    // 验证文件大小
    if (!validateFileSize(file)) {
      message.error('文件过大，最大支持 10MB')
      return false
    }
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        // 解析 JSON
        const imported = JSON.parse(e.target?.result as string)
        
        // 检测文件格式
        const detection = detectFileFormat(imported)
        
        // 验证 content 字段
        if (!detection.content) {
          message.error('导入失败：文件内容为空')
          return
        }
        
        // 格式化内容
        const formatted = JSON.stringify(detection.content, null, 2)
        
        // 触发成功回调
        onImportSuccess(formatted, detection.metadata)
        
        // 显示提示
        if (detection.hasMetadata && detection.metadata) {
          const time = new Date(detection.metadata.exportedAt).toLocaleString()
          showLightNotification(
            `✅ 已导入 (${detection.metadata.params} | ${time})`
          )
        } else {
          showLightNotification('✅ 已导入 JSON 文件')
        }
        
        logger.log('Import successful:', {
          hasMetadata: detection.hasMetadata,
          params: detection.metadata?.params,
          size: file.size
        })
      } catch (error) {
        message.error('导入失败：文件格式错误或非法 JSON')
        logger.error('Import failed:', error)
      }
    }
    
    reader.onerror = () => {
      message.error('文件读取失败')
      logger.error('FileReader error')
    }
    
    reader.readAsText(file)
    return false  // 阻止默认上传行为
  }, [onImportSuccess, showLightNotification])
  
  return {
    handleExport,
    handleImport
  }
}

