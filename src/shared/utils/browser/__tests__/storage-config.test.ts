import { SIMPLE_STORAGE_FIELDS } from '../storage-config'

describe('storage-config', () => {
  describe('SIMPLE_STORAGE_FIELDS 结构验证', () => {
    it('应该包含所有必需的字段', () => {
      const expectedFields = [
        'isActive',
        'attributeName',
        'drawerWidth',
        'getFunctionName',
        'updateFunctionName',
        'autoParseString',
        'enableDebugLog',
        'highlightColor',
        'maxFavoritesCount',
        'draftRetentionDays',
        'autoSaveDraft',
        'draftAutoSaveDebounce',
        'previewConfig',
        'maxHistoryCount',
        'highlightAllConfig',
        'recordingModeConfig',
        'iframeConfig',
        'enableAstTypeHints',
        'editorTheme',
        'previewFunctionName',
        'apiConfig',
        'drawerShortcuts',
      ]

      expectedFields.forEach((field) => {
        expect(SIMPLE_STORAGE_FIELDS).toHaveProperty(field)
      })
    })

    it('每个字段应该包含 key 和 defaultValue', () => {
      Object.entries(SIMPLE_STORAGE_FIELDS).forEach(([_fieldName, config]) => {
        expect(config).toHaveProperty('key')
        expect(config).toHaveProperty('defaultValue')
        expect(typeof config.key).toBe('string')
        expect(config.key.length).toBeGreaterThan(0)
      })
    })
  })

  describe('highlightColor validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.highlightColor

    it('有效的颜色字符串应该返回 true', () => {
      expect(validator?.('#39C5BB')).toBe(true)
      expect(validator?.('#FF0000')).toBe(true)
      expect(validator?.('rgb(255,0,0)')).toBe(true)
      expect(validator?.('red')).toBe(true)
    })

    it('空字符串应该返回 false', () => {
      expect(validator?.('')).toBe(false)
    })

    it('非字符串类型应该返回 false', () => {
      expect(validator?.(null)).toBe(false)
      expect(validator?.(undefined)).toBe(false)
      expect(validator?.(123)).toBe(false)
      expect(validator?.({})).toBe(false)
      expect(validator?.([])).toBe(false)
    })
  })

  describe('maxHistoryCount validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.maxHistoryCount

    it('有效范围内的数字应该返回 true', () => {
      expect(validator?.(10)).toBe(true)
      expect(validator?.(50)).toBe(true)
      expect(validator?.(100)).toBe(true)
      expect(validator?.(200)).toBe(true)
    })

    it('小于最小值应该返回 false', () => {
      expect(validator?.(9)).toBe(false)
      expect(validator?.(0)).toBe(false)
      expect(validator?.(-1)).toBe(false)
    })

    it('大于最大值应该返回 false', () => {
      expect(validator?.(201)).toBe(false)
      expect(validator?.(1000)).toBe(false)
    })

    it('非数字类型应该返回 false', () => {
      expect(validator?.('50')).toBe(false)
      expect(validator?.(null)).toBe(false)
      expect(validator?.(undefined)).toBe(false)
      expect(validator?.({})).toBe(false)
    })
  })

  describe('highlightAllConfig validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.highlightAllConfig

    it('有效配置应该返回 true', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 500,
        })
      ).toBe(true)

      expect(
        validator?.({
          enabled: false,
          keyBinding: '1',
          maxHighlightCount: 100,
        })
      ).toBe(true)

      expect(
        validator?.({
          enabled: true,
          keyBinding: 'Z',
          maxHighlightCount: 1000,
        })
      ).toBe(true)
    })

    it('enabled 非布尔值应该返回 false', () => {
      expect(
        validator?.({
          enabled: 'true',
          keyBinding: 'a',
          maxHighlightCount: 500,
        })
      ).toBe(false)
    })

    it('keyBinding 不是单个字符应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'ab',
          maxHighlightCount: 500,
        })
      ).toBe(false)

      expect(
        validator?.({
          enabled: true,
          keyBinding: '',
          maxHighlightCount: 500,
        })
      ).toBe(false)
    })

    it('keyBinding 包含非字母数字字符应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: '!',
          maxHighlightCount: 500,
        })
      ).toBe(false)

      expect(
        validator?.({
          enabled: true,
          keyBinding: ' ',
          maxHighlightCount: 500,
        })
      ).toBe(false)
    })

    it('maxHighlightCount 超出范围应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 99,
        })
      ).toBe(false)

      expect(
        validator?.({
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 1001,
        })
      ).toBe(false)
    })

    it('null 或 undefined 应该返回 falsy', () => {
      expect(validator?.(null)).toBeFalsy()
      expect(validator?.(undefined)).toBeFalsy()
    })
  })

  describe('recordingModeConfig validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.recordingModeConfig

    it('有效配置应该返回 true', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
        })
      ).toBe(true)

      expect(
        validator?.({
          enabled: false,
          keyBinding: '5',
          highlightColor: 'red',
          pollingInterval: 50,
        })
      ).toBe(true)

      expect(
        validator?.({
          enabled: true,
          keyBinding: 'A',
          highlightColor: '#000',
          pollingInterval: 1000,
        })
      ).toBe(true)
    })

    it('enabled 非布尔值应该返回 false', () => {
      expect(
        validator?.({
          enabled: 1,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
        })
      ).toBe(false)
    })

    it('keyBinding 不是单个字母数字字符应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'rr',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
        })
      ).toBe(false)
    })

    it('highlightColor 为空应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '',
          pollingInterval: 100,
        })
      ).toBe(false)
    })

    it('pollingInterval 超出范围应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 49,
        })
      ).toBe(false)

      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 1001,
        })
      ).toBe(false)
    })

    it('null 或 undefined 应该返回 falsy', () => {
      expect(validator?.(null)).toBeFalsy()
      expect(validator?.(undefined)).toBeFalsy()
    })
  })

  describe('iframeConfig validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.iframeConfig

    it('有效配置应该返回 true', () => {
      expect(
        validator?.({
          enabled: true,
          schemaTarget: 'iframe',
        })
      ).toBe(true)

      expect(
        validator?.({
          enabled: false,
          schemaTarget: 'topFrame',
        })
      ).toBe(true)
    })

    it('enabled 非布尔值应该返回 false', () => {
      expect(
        validator?.({
          enabled: 'true',
          schemaTarget: 'iframe',
        })
      ).toBe(false)
    })

    it('schemaTarget 无效值应该返回 false', () => {
      expect(
        validator?.({
          enabled: true,
          schemaTarget: 'invalid',
        })
      ).toBe(false)

      expect(
        validator?.({
          enabled: true,
          schemaTarget: '',
        })
      ).toBe(false)
    })

    it('null 或 undefined 应该返回 falsy', () => {
      expect(validator?.(null)).toBeFalsy()
      expect(validator?.(undefined)).toBeFalsy()
    })
  })

  describe('editorTheme validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.editorTheme

    it('有效主题应该返回 true', () => {
      expect(validator?.('light')).toBe(true)
      expect(validator?.('dark')).toBe(true)
      expect(validator?.('schemaEditorDark')).toBe(true)
    })

    it('无效主题应该返回 false', () => {
      expect(validator?.('invalid')).toBe(false)
      expect(validator?.('')).toBe(false)
      expect(validator?.('Light')).toBe(false)
    })

    it('非字符串类型应该返回 false', () => {
      expect(validator?.(null)).toBe(false)
      expect(validator?.(undefined)).toBe(false)
      expect(validator?.(123)).toBe(false)
    })
  })

  describe('apiConfig validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.apiConfig

    it('有效配置应该返回 true', () => {
      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 5,
        })
      ).toBe(true)

      expect(
        validator?.({
          communicationMode: 'windowFunction',
          requestTimeout: 1,
        })
      ).toBe(true)

      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 30,
        })
      ).toBe(true)
    })

    it('communicationMode 无效值应该返回 false', () => {
      expect(
        validator?.({
          communicationMode: 'invalid',
          requestTimeout: 5,
        })
      ).toBe(false)
    })

    it('requestTimeout 超出范围应该返回 false', () => {
      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 0,
        })
      ).toBe(false)

      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 31,
        })
      ).toBe(false)
    })

    it('null 或 undefined 应该返回 falsy', () => {
      expect(validator?.(null)).toBeFalsy()
      expect(validator?.(undefined)).toBeFalsy()
    })
  })

  describe('drawerShortcuts validator', () => {
    const { validator } = SIMPLE_STORAGE_FIELDS.drawerShortcuts

    const validShortcut = { key: 's', ctrlOrCmd: true }
    const validConfig = {
      save: validShortcut,
      format: validShortcut,
      openOrUpdatePreview: validShortcut,
      closePreview: validShortcut,
    }

    it('有效配置应该返回 true', () => {
      expect(validator?.(validConfig)).toBe(true)

      expect(
        validator?.({
          save: { key: 'a', ctrlOrCmd: false },
          format: { key: 'b', ctrlOrCmd: true },
          openOrUpdatePreview: { key: 'c', ctrlOrCmd: false },
          closePreview: { key: 'd', ctrlOrCmd: true },
        })
      ).toBe(true)
    })

    it('缺少必需快捷键应该返回 falsy', () => {
      expect(
        validator?.({
          save: validShortcut,
          format: validShortcut,
          openOrUpdatePreview: validShortcut,
          // 缺少 closePreview
        })
      ).toBeFalsy()
    })

    it('快捷键缺少 key 属性应该返回 falsy', () => {
      expect(
        validator?.({
          save: { ctrlOrCmd: true },
          format: validShortcut,
          openOrUpdatePreview: validShortcut,
          closePreview: validShortcut,
        })
      ).toBeFalsy()
    })

    it('快捷键缺少 ctrlOrCmd 属性应该返回 falsy', () => {
      expect(
        validator?.({
          save: { key: 's' },
          format: validShortcut,
          openOrUpdatePreview: validShortcut,
          closePreview: validShortcut,
        })
      ).toBeFalsy()
    })

    it('快捷键 key 不是字符串应该返回 falsy', () => {
      expect(
        validator?.({
          save: { key: 123, ctrlOrCmd: true },
          format: validShortcut,
          openOrUpdatePreview: validShortcut,
          closePreview: validShortcut,
        })
      ).toBeFalsy()
    })

    it('快捷键 ctrlOrCmd 不是布尔值应该返回 falsy', () => {
      expect(
        validator?.({
          save: { key: 's', ctrlOrCmd: 'true' },
          format: validShortcut,
          openOrUpdatePreview: validShortcut,
          closePreview: validShortcut,
        })
      ).toBeFalsy()
    })

    it('null 或 undefined 应该返回 falsy', () => {
      expect(validator?.(null)).toBeFalsy()
      expect(validator?.(undefined)).toBeFalsy()
    })
  })

  describe('默认值验证', () => {
    it('isActive 默认值应该是 boolean', () => {
      expect(typeof SIMPLE_STORAGE_FIELDS.isActive.defaultValue).toBe('boolean')
    })

    it('drawerWidth 默认值应该是字符串', () => {
      expect(typeof SIMPLE_STORAGE_FIELDS.drawerWidth.defaultValue).toBe('string')
    })

    it('maxFavoritesCount 默认值应该是数字', () => {
      expect(typeof SIMPLE_STORAGE_FIELDS.maxFavoritesCount.defaultValue).toBe('number')
    })

    it('previewConfig 默认值应该是对象', () => {
      expect(typeof SIMPLE_STORAGE_FIELDS.previewConfig.defaultValue).toBe('object')
      expect(SIMPLE_STORAGE_FIELDS.previewConfig.defaultValue).toHaveProperty('previewWidth')
      expect(SIMPLE_STORAGE_FIELDS.previewConfig.defaultValue).toHaveProperty('updateDelay')
      expect(SIMPLE_STORAGE_FIELDS.previewConfig.defaultValue).toHaveProperty('autoUpdate')
    })

    it('apiConfig 默认值应该包含通信模式', () => {
      expect(SIMPLE_STORAGE_FIELDS.apiConfig.defaultValue).toHaveProperty('communicationMode')
      expect(['postMessage', 'windowFunction']).toContain(
        SIMPLE_STORAGE_FIELDS.apiConfig.defaultValue.communicationMode
      )
    })
  })

  describe('边界情况', () => {
    it('highlightAllConfig maxHighlightCount 边界值', () => {
      const { validator } = SIMPLE_STORAGE_FIELDS.highlightAllConfig

      // 最小有效值
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 100,
        })
      ).toBe(true)

      // 最大有效值
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 1000,
        })
      ).toBe(true)
    })

    it('recordingModeConfig pollingInterval 边界值', () => {
      const { validator } = SIMPLE_STORAGE_FIELDS.recordingModeConfig

      // 最小有效值
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#000',
          pollingInterval: 50,
        })
      ).toBe(true)

      // 最大有效值
      expect(
        validator?.({
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#000',
          pollingInterval: 1000,
        })
      ).toBe(true)
    })

    it('apiConfig requestTimeout 边界值', () => {
      const { validator } = SIMPLE_STORAGE_FIELDS.apiConfig

      // 最小有效值
      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 1,
        })
      ).toBe(true)

      // 最大有效值
      expect(
        validator?.({
          communicationMode: 'postMessage',
          requestTimeout: 30,
        })
      ).toBe(true)
    })

    it('maxHistoryCount 边界值', () => {
      const { validator } = SIMPLE_STORAGE_FIELDS.maxHistoryCount

      // 最小有效值
      expect(validator?.(10)).toBe(true)

      // 最大有效值
      expect(validator?.(200)).toBe(true)
    })
  })
})
