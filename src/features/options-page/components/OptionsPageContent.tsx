import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import { generate } from '@ant-design/colors'
import { SettingOutlined, UndoOutlined } from '@ant-design/icons'
import { ConfigProvider, Form, message, Popconfirm, Tooltip } from 'antd'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SideMenu } from './SideMenu'
import { SECTION_KEYS } from '../config/field-config'
import { useResetConfig, useSectionNavigation, useSettingsForm, useStorageSync } from '../hooks'
import { usePresetsManagement } from '@/features/config-presets/hooks/usePresetsManagement'
import { PresetsManager } from '@/features/config-presets/components/PresetsManager'
import { storage as globalStorage } from '@/shared/utils/browser/storage'
import type { ConfigPreset } from '@/shared/types'
import { DataManagementSection } from '../sections/DataManagementSection'
import { DebugSection } from '../sections/DebugSection'
import { EditorConfigSection } from '../sections/EditorConfigSection'
import { ElementDetectionSection } from '../sections/ElementDetectionSection'
import { FeatureToggleSection } from '../sections/FeatureToggleSection'
import { IntegrationConfigSection } from '../sections/IntegrationConfigSection'
import { KeyboardShortcutsSection } from '../sections/KeyboardShortcutsSection'
import { PreviewConfigSection } from '../sections/PreviewConfigSection'
import { UsageGuideSection } from '../sections/UsageGuideSection'
import {
  BackgroundGlowLayer,
  CheckUpdateButton,
  Container,
  EdgeGlowLayer,
  HeaderContent,
  HeaderSection,
  HeaderToolbar,
  HintContainer,
  HintContent,
  HintDot,
  HintText,
  ManagePresetButton,
  PageRoot,
  PageTitle,
  ResetDefaultButton,
  SavePresetButton,
  ScrollWrapper,
  VersionContainer,
  VersionDivider,
  VersionTag,
  VersionText,
} from '../styles/layout.styles'
import type { OptionsPageContentProps } from '../types'

/** 当前插件版本 */
const CURRENT_VERSION = 'v2.4.1'

/**
 * 设置页面内容组件（纯UI组件）
 * 通过 props 接收存储服务和外部操作
 */
export const OptionsPageContent: React.FC<OptionsPageContentProps> = (props) => {
  const { storage, actions = {} } = props
  const {
    onCheckUpdate,
    shouldSetDocumentTitle = true,
    isReleaseBuild = typeof __IS_RELEASE_BUILD__ !== 'undefined' ? __IS_RELEASE_BUILD__ : false,
  } = actions

  const [form] = Form.useForm()

  /** 菜单折叠状态（纯 UI 状态，不属于表单） */
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  /**
   * 主题色状态（需要在 Form 外部的 ConfigProvider 中使用）
   * 不能使用 Form.useWatch，因为它在 Form 挂载前返回 undefined
   */
  const [themeColor, setThemeColor] = useState(DEFAULT_VALUES.themeColor)

  /** 预设配置数量状态 */
  const [presetCount, setPresetCount] = useState(0)
  const [maxPresetCount, setMaxPresetCount] = useState(DEFAULT_VALUES.maxConfigPresetsCount)

  /** 光晕层 refs */
  const pageRootRef = useRef<HTMLDivElement>(null)
  const bgGlowRef = useRef<HTMLDivElement>(null)
  const edgeGlowRef = useRef<HTMLDivElement>(null)

  /** Section 导航 */
  const {
    activeSection,
    expandedSections,
    toggleSectionExpanded,
    scrollToSection,
    scrollToAnchor,
  } = useSectionNavigation()

  /** 表单处理 */
  const { loadSettings, handleValuesChange } = useSettingsForm({
    form,
    storage,
    onThemeColorChange: setThemeColor,
    showSuccess: (msg) => message.success(msg, 1.5),
    showError: (msg) => message.error(msg),
  })

  /** 重置配置 */
  const { resetSectionToDefault, resetAllToDefault } = useResetConfig({
    form,
    storage,
    onThemeColorChange: setThemeColor,
    showSuccess: (msg) => message.success(msg),
  })

  /** 预设配置应用处理 */
  const handleApplyPreset = useCallback(
    async (preset: ConfigPreset) => {
      try {
        // 批量保存所有配置到 storage（使用适配器）
        await storage.setAllConfig(preset.config)

        message.success('预设配置已应用', 1.5)
      } catch (error) {
        console.error('应用预设配置失败:', error)
        message.error('应用预设配置失败')
      }
    },
    [storage]
  )

  /** 预设配置管理 */
  const {
    presetsList,
    presetsModalVisible,
    addPresetModalVisible,
    presetNameInput,
    setPresetNameInput,
    handleOpenAddPreset,
    handleAddPreset,
    handleOpenPresets,
    handleApplyPreset: handleApplyPresetFromHook,
    handleDeletePreset,
    closePresetsModal,
    closeAddPresetModal,
  } = usePresetsManagement({
    onApplyPreset: handleApplyPreset,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
    onSuccess: (msg) => message.success(msg, 1.5),
  })

  /** 加载预设数量和上限 */
  const loadPresetLimits = useCallback(async () => {
    try {
      const presets = await globalStorage.getConfigPresets()
      const max = await globalStorage.getMaxConfigPresetsCount()
      setPresetCount(presets.length)
      setMaxPresetCount(max)
    } catch (error) {
      console.error('加载预设配置上限失败:', error)
    }
  }, [])

  /** 包装 handleOpenAddPreset 以检查上限 */
  const handleOpenAddPresetWithCheck = useCallback(async () => {
    await loadPresetLimits()
    if (presetCount >= maxPresetCount) {
      message.error(
        `已达到预设配置数量上限（${presetCount}/${maxPresetCount}），请删除旧预设后再添加`
      )
      return
    }
    handleOpenAddPreset()
  }, [presetCount, maxPresetCount, handleOpenAddPreset, loadPresetLimits])

  /** 包装 handleAddPreset 以在添加后刷新数量 */
  const handleAddPresetWithRefresh = useCallback(async () => {
    await handleAddPreset()
    await loadPresetLimits()
  }, [handleAddPreset, loadPresetLimits])

  /** 包装 handleDeletePreset 以在删除后刷新数量 */
  const handleDeletePresetWithRefresh = useCallback(
    async (id: string) => {
      await handleDeletePreset(id)
      await loadPresetLimits()
    },
    [handleDeletePreset, loadPresetLimits]
  )

  /**
   * 为光晕层设置随机负延迟，使每次刷新从不同位置开始
   */
  useLayoutEffect(() => {
    const glowRefs = [pageRootRef, bgGlowRef, edgeGlowRef]

    glowRefs.forEach((ref) => {
      if (ref.current) {
        const randomDelay1 = -Math.random() * 40
        const randomDelay2 = -Math.random() * 40
        ref.current.style.setProperty('--glow-delay-1', `${randomDelay1}s`)
        ref.current.style.setProperty('--glow-delay-2', `${randomDelay2}s`)
      }
    })
  }, [])

  /** 加载设置 */
  useDeferredEffect(() => {
    loadSettings()
    loadPresetLimits()
  }, [])

  /** 监听配置变化（如应用预设配置时） */
  useStorageSync({ loadSettings })

  /**
   * 设置页面标题
   */
  useEffect(() => {
    if (shouldSetDocumentTitle) {
      document.title = `Schema Element Editor 设置 (${CURRENT_VERSION})`
    }
  }, [shouldSetDocumentTitle])

  /** 生成主题色梯度 */
  const themeColors = useMemo(() => {
    // 使用 @ant-design/colors 生成完整的颜色序列
    // 索引: 0-1 最浅, 4 hover, 5 主色, 6 active, 8-9 最深
    const colors = generate(themeColor)
    return {
      primaryColor: colors[5],
      hoverColor: colors[4],
      activeColor: colors[6],
      lightBgColor: colors[0],
      borderColor: colors[2],
    }
  }, [themeColor])

  /** 动态主题配置 */
  const themeConfig = useMemo(() => {
    const { primaryColor, hoverColor, activeColor, lightBgColor, borderColor } = themeColors

    return {
      cssVar: { prefix: 'see' },
      token: {
        colorPrimary: primaryColor,
        colorPrimaryHover: hoverColor,
        colorPrimaryActive: activeColor,
        colorLink: primaryColor,
        colorLinkHover: hoverColor,
        colorLinkActive: activeColor,
      },
      components: {
        Alert: {
          colorInfo: primaryColor,
          colorInfoBg: lightBgColor,
          colorInfoBorder: borderColor,
        },
        Button: {
          primaryColor: '#ffffff',
          colorLink: primaryColor,
          colorLinkHover: hoverColor,
          colorLinkActive: activeColor,
          defaultHoverColor: hoverColor,
          defaultHoverBorderColor: hoverColor,
          defaultActiveColor: activeColor,
          defaultActiveBorderColor: activeColor,
        },
        Form: {
          labelColor: '#666F8D',
          labelFontSize: 14,
        },
      },
    }
  }, [themeColors])

  return (
    <ConfigProvider theme={themeConfig} prefixCls="see">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={DEFAULT_VALUES}
      >
        <PageRoot ref={pageRootRef}>
          {/* 背景光晕层 */}
          <BackgroundGlowLayer ref={bgGlowRef} />
          <EdgeGlowLayer ref={edgeGlowRef} />

          {/* 侧边菜单 */}
          <SideMenu
            collapsed={menuCollapsed}
            onCollapsedChange={setMenuCollapsed}
            activeSection={activeSection}
            onMenuClick={scrollToSection}
            onSubMenuClick={scrollToAnchor}
            isReleaseBuild={isReleaseBuild}
          />

          {/* 内容区域 */}
          <ScrollWrapper $menuCollapsed={menuCollapsed} data-scroll-container>
            <Container>
              <HeaderSection justify="space-between" align="center" gap={16}>
                <HeaderContent>
                  <PageTitle level={2}>设置</PageTitle>
                </HeaderContent>
              </HeaderSection>

              <HeaderToolbar align="center">
                <VersionContainer>
                  <VersionText>Schema Element Editor</VersionText>
                  <VersionTag>{CURRENT_VERSION}</VersionTag>

                  <VersionDivider />
                  <CheckUpdateButton
                    onClick={() => {
                      onCheckUpdate?.()
                    }}
                    type="primary"
                  >
                    检查更新
                  </CheckUpdateButton>

                  <VersionDivider />
                  <Tooltip
                    title={
                      presetCount >= maxPresetCount
                        ? `已达到预设配置数量上限（${presetCount}/${maxPresetCount}），请删除旧预设后再添加`
                        : '保存当前配置为预设'
                    }
                  >
                    <SavePresetButton
                      onClick={handleOpenAddPresetWithCheck}
                      type="default"
                      disabled={presetCount >= maxPresetCount}
                    >
                      保存为预设配置
                    </SavePresetButton>
                  </Tooltip>
                  <Tooltip title="管理预设配置">
                    <ManagePresetButton onClick={handleOpenPresets} icon={<SettingOutlined />} />
                  </Tooltip>
                </VersionContainer>
                <HintContainer>
                  <HintContent>
                    <HintDot />
                    <HintText>所有配置项通过验证后将自动保存</HintText>
                  </HintContent>
                  <Popconfirm
                    title="恢复默认配置"
                    description="确定要将所有配置恢复为默认值吗？"
                    onConfirm={resetAllToDefault}
                    okText="确定"
                    cancelText="取消"
                  >
                    <ResetDefaultButton>
                      <UndoOutlined />
                      恢复全部默认
                    </ResetDefaultButton>
                  </Popconfirm>
                </HintContainer>
              </HeaderToolbar>

              <IntegrationConfigSection
                sectionId="section-integration-config"
                isActive={expandedSections.has('section-integration-config')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-integration-config', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)}
              />

              <ElementDetectionSection
                sectionId="section-element-detection"
                isActive={expandedSections.has('section-element-detection')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-element-detection', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)}
              />

              <EditorConfigSection
                sectionId="section-editor-config"
                isActive={expandedSections.has('section-editor-config')}
                onActiveChange={(active) => toggleSectionExpanded('section-editor-config', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)}
              />

              <FeatureToggleSection
                sectionId="section-feature-toggle"
                isActive={expandedSections.has('section-feature-toggle')}
                onActiveChange={(active) => toggleSectionExpanded('section-feature-toggle', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.FEATURE_TOGGLE)}
              />

              <PreviewConfigSection
                sectionId="section-preview-config"
                isActive={expandedSections.has('section-preview-config')}
                onActiveChange={(active) => toggleSectionExpanded('section-preview-config', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.PREVIEW_CONFIG)}
              />

              <DataManagementSection
                sectionId="section-data-management"
                isActive={expandedSections.has('section-data-management')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-data-management', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DATA_MANAGEMENT)}
              />

              <KeyboardShortcutsSection
                sectionId="section-keyboard-shortcuts"
                isActive={expandedSections.has('section-keyboard-shortcuts')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-keyboard-shortcuts', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.KEYBOARD_SHORTCUTS)}
                themeColor={themeColors.primaryColor}
                hoverColor={themeColors.hoverColor}
                activeColor={themeColors.activeColor}
              />

              {!isReleaseBuild && (
                <DebugSection
                  sectionId="section-debug"
                  isActive={expandedSections.has('section-debug')}
                  onActiveChange={(active) => toggleSectionExpanded('section-debug', active)}
                  onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DEBUG)}
                />
              )}

              <UsageGuideSection
                sectionId="section-usage-guide"
                isActive={expandedSections.has('section-usage-guide')}
                onActiveChange={(active) => toggleSectionExpanded('section-usage-guide', active)}
              />
            </Container>
          </ScrollWrapper>

          {/* 预设配置管理模态框 */}
          <PresetsManager
            addPresetModalVisible={addPresetModalVisible}
            presetNameInput={presetNameInput}
            presetsModalVisible={presetsModalVisible}
            presetsList={presetsList}
            themeColor={themeColors.primaryColor}
            onAddPresetInputChange={setPresetNameInput}
            onAddPreset={handleAddPresetWithRefresh}
            onCloseAddPresetModal={closeAddPresetModal}
            onClosePresetsModal={closePresetsModal}
            onApplyPreset={handleApplyPresetFromHook}
            onDeletePreset={handleDeletePresetWithRefresh}
          />
        </PageRoot>
      </Form>
    </ConfigProvider>
  )
}
