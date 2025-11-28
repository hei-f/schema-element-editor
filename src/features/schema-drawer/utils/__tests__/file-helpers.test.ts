import {
  buildExportData,
  detectFileFormat,
  generateExportFileName,
  MAX_FILE_SIZE,
  validateFileSize,
} from '../file-helpers'
import type { ExportMetadata } from '../../types/export'

describe('file-helpers', () => {
  describe('generateExportFileName', () => {
    it('应该生成正确格式的文件名', () => {
      const fileName = generateExportFileName('param1,param2')

      expect(fileName).toMatch(/^content-param1_param2-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/)
    })

    it('应该清理参数键中的非法字符', () => {
      const fileName = generateExportFileName('param@#$1,param!2')

      expect(fileName).toMatch(/^content-param___1_param_2-/)
    })

    it('应该保留合法字符（字母、数字、连字符、下划线）', () => {
      const fileName = generateExportFileName('test-param_123')

      expect(fileName).toContain('content-test-param_123-')
    })
  })

  describe('detectFileFormat', () => {
    it('应该识别带元数据的导出文件', () => {
      const data = {
        __SCHEMA_EDITOR_EXPORT__: true,
        content: { type: 'card' },
        metadata: {
          params: 'test',
          exportedAt: '2025-11-24T10:00:00.000Z',
          version: '1.0.0',
          wasStringData: false,
          url: 'https://example.com',
        },
      }

      const result = detectFileFormat(data)

      expect(result).toEqual({
        hasMetadata: true,
        content: { type: 'card' },
        metadata: expect.objectContaining({
          params: 'test',
          wasStringData: false,
        }),
      })
    })

    it('应该识别普通 JSON 文件', () => {
      const data = { type: 'card', title: 'test' }

      const result = detectFileFormat(data)

      expect(result).toEqual({
        hasMetadata: false,
        content: { type: 'card', title: 'test' },
      })
    })

    it('当标记字段不是 true 时应该识别为普通文件', () => {
      const data = {
        __SCHEMA_EDITOR_EXPORT__: false,
        content: { type: 'card' },
      }

      const result = detectFileFormat(data)

      expect(result).toEqual({
        hasMetadata: false,
        content: data,
      })
    })

    it('应该处理 null 和 undefined', () => {
      expect(detectFileFormat(null)).toEqual({
        hasMetadata: false,
        content: null,
      })

      expect(detectFileFormat(undefined)).toEqual({
        hasMetadata: false,
        content: undefined,
      })
    })
  })

  describe('validateFileSize', () => {
    it('应该接受小于限制的文件', () => {
      const file = new File(['test'], 'test.json', { type: 'application/json' })

      expect(validateFileSize(file)).toBe(true)
    })

    it('应该接受等于限制的文件', () => {
      const content = 'x'.repeat(MAX_FILE_SIZE)
      const file = new File([content], 'test.json', { type: 'application/json' })

      expect(validateFileSize(file)).toBe(true)
    })

    it('应该拒绝超过限制的文件', () => {
      const content = 'x'.repeat(MAX_FILE_SIZE + 1)
      const file = new File([content], 'test.json', { type: 'application/json' })

      expect(validateFileSize(file)).toBe(false)
    })
  })

  describe('buildExportData', () => {
    it('应该构建正确的导出数据格式', () => {
      const content = { type: 'card', title: 'test' }
      const metadata: ExportMetadata = {
        params: 'param1,param2',
        exportedAt: '2025-11-24T10:00:00.000Z',
        version: '1.0.0',
        wasStringData: false,
        url: 'https://example.com',
      }

      const result = buildExportData(content, metadata)

      expect(result).toEqual({
        __SCHEMA_EDITOR_EXPORT__: true,
        content,
        metadata,
      })
    })

    it('应该保持 content 的引用', () => {
      const content = { type: 'card', nested: { data: 'value' } }
      const metadata: ExportMetadata = {
        params: 'test',
        exportedAt: '2025-11-24T10:00:00.000Z',
        version: '1.0.0',
        wasStringData: false,
        url: 'https://example.com',
      }

      const result = buildExportData(content, metadata)

      expect(result.content).toBe(content)
      expect(result.metadata).toBe(metadata)
    })
  })

  describe('MAX_FILE_SIZE', () => {
    it('应该等于 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
    })
  })
})
