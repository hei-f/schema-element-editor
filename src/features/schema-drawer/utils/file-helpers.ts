import type { ExportFileFormat, ExportMetadata, FileDetectionResult } from '../types/export'

/** 文件大小限制（10MB） */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 生成导出文件名
 * @param paramsKey - 参数键
 * @returns 文件名（格式：content-{params}-{timestamp}.json）
 */
export function generateExportFileName(paramsKey: string): string {
  const sanitizedParams = paramsKey.replace(/[^a-zA-Z0-9-_]/g, '_')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `content-${sanitizedParams}-${timestamp}.json`
}

/**
 * 检测导入文件格式
 * @param data - 解析后的 JSON 数据
 * @returns 检测结果
 */
export function detectFileFormat(data: any): FileDetectionResult {
  if (data && data.__SCHEMA_ELEMENT_EDITOR_EXPORT__ === true) {
    // 带元数据的导出格式
    return {
      hasMetadata: true,
      content: data.content,
      metadata: data.metadata,
    }
  }

  // 普通 JSON 文件
  return {
    hasMetadata: false,
    content: data,
  }
}

/**
 * 验证文件大小
 * @param file - 文件对象
 * @returns 是否通过验证
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * 构建导出数据
 * @param content - 内容数据
 * @param metadata - 元数据
 * @returns 导出文件格式
 */
export function buildExportData(content: any, metadata: ExportMetadata): ExportFileFormat {
  return {
    __SCHEMA_ELEMENT_EDITOR_EXPORT__: true,
    content,
    metadata,
  }
}
