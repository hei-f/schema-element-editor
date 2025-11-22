import { FORM_FIELD_NAMES } from '@/shared/constants/defaults'
import { storage } from '@/shared/utils/browser/storage'

/**
 * 字段分组配置 - 需要组合保存的字段
 */
export const FIELD_GROUPS = {
  searchConfig: {
    fields: new Set<string>([
      FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN,
      FORM_FIELD_NAMES.SEARCH_DEPTH_UP,
      FORM_FIELD_NAMES.THROTTLE_INTERVAL
    ]),
    save: async (allValues: any) => {
      await storage.setSearchConfig({
        searchDepthDown: allValues[FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN],
        searchDepthUp: allValues[FORM_FIELD_NAMES.SEARCH_DEPTH_UP],
        throttleInterval: allValues[FORM_FIELD_NAMES.THROTTLE_INTERVAL]
      })
    }
  },
  functionNames: {
    fields: new Set<string>([
      FORM_FIELD_NAMES.GET_FUNCTION_NAME,
      FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME
    ]),
    save: async (allValues: any) => {
      await storage.setFunctionNames(
        allValues[FORM_FIELD_NAMES.GET_FUNCTION_NAME],
        allValues[FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME]
      )
    }
  },
  toolbarButtons: {
    fields: new Set<string>([
      FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE,
      FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE,
      FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE,
      FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT
    ]),
    save: async (allValues: any) => {
      await storage.setToolbarButtons({
        astRawStringToggle: allValues[FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE],
        deserialize: allValues[FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE],
        serialize: allValues[FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE],
        format: allValues[FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT]
      })
    }
  }
}

/**
 * 需要防抖保存的字段集合
 */
export const DEBOUNCE_FIELDS = new Set<string>([
  FORM_FIELD_NAMES.ATTRIBUTE_NAME,
  FORM_FIELD_NAMES.DRAWER_WIDTH,
  FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN,
  FORM_FIELD_NAMES.SEARCH_DEPTH_UP,
  FORM_FIELD_NAMES.THROTTLE_INTERVAL,
  FORM_FIELD_NAMES.GET_FUNCTION_NAME,
  FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME,
  FORM_FIELD_NAMES.MAX_FAVORITES_COUNT,
  FORM_FIELD_NAMES.HIGHLIGHT_COLOR
])

/**
 * 独立字段与 storage 方法的映射
 */
export const FIELD_STORAGE_MAP: Record<string, string> = {
  [FORM_FIELD_NAMES.ATTRIBUTE_NAME]: 'setAttributeName',
  [FORM_FIELD_NAMES.DRAWER_WIDTH]: 'setDrawerWidth',
  [FORM_FIELD_NAMES.AUTO_PARSE_STRING]: 'setAutoParseString',
  [FORM_FIELD_NAMES.ENABLE_DEBUG_LOG]: 'setEnableDebugLog',
  [FORM_FIELD_NAMES.HIGHLIGHT_COLOR]: 'setHighlightColor',
  [FORM_FIELD_NAMES.MAX_FAVORITES_COUNT]: 'setMaxFavoritesCount',
  [FORM_FIELD_NAMES.AUTO_SAVE_DRAFT]: 'setAutoSaveDraft'
}

