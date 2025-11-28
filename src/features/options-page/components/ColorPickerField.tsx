import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { normalizeColorValue } from '@/shared/utils/ui/color'
import { ColorPicker } from 'antd'
import type { Color } from 'antd/es/color-picker'
import React from 'react'

interface ColorPickerFieldProps {
  value?: string
  onChange?: (value: string) => void
  showText?: boolean
  format?: 'hex' | 'rgb' | 'hsb'
  presets?: Array<{
    label: string
    colors: string[]
  }>
}

/**
 * ColorPicker 包装组件，确保值始终为字符串
 *
 * Ant Design 5.20.0+ 使用 @ant-design/fast-color，
 * 只接受字符串格式的颜色值，此组件确保类型安全
 */
export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  onChange,
  showText = true,
  format = 'hex',
  presets,
}) => {
  const handleChange = (color: Color | string) => {
    if (!onChange) return

    const defaultColor = DEFAULT_VALUES.highlightColor

    if (!color) {
      onChange(defaultColor)
    } else if (typeof color === 'string') {
      onChange(color)
    } else if ((color as any).cleared) {
      onChange(defaultColor)
    } else {
      onChange((color as Color).toHexString?.() ?? defaultColor)
    }
  }

  const normalizedValue = normalizeColorValue(value, DEFAULT_VALUES.highlightColor)

  return (
    <ColorPicker
      value={normalizedValue}
      onChange={handleChange}
      showText={showText}
      format={format}
      presets={presets}
    />
  )
}
