import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { normalizeColorValue } from '@/shared/utils/ui/color'
import { ColorPicker, Flex } from 'antd'
import type { Color } from 'antd/es/color-picker'
import React, { useCallback } from 'react'
import { SurpriseButton } from '../styles/layout.styles'

interface ColorPickerFieldProps {
  value?: string
  onChange?: (value: string) => void
  showText?: boolean
  format?: 'hex' | 'rgb' | 'hsb'
  presets?: Array<{
    label: string
    colors: string[]
  }>
  /** 是否显示 surprise me 按钮 */
  showSurprise?: boolean
}

/** 生成随机颜色 */
export const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 20) // 45-65%
  return hslToHex(hue, saturation, lightness)
}

/** HSL 转 Hex */
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
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
  showSurprise = true,
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

  const handleSurprise = useCallback(() => {
    if (onChange) {
      onChange(generateRandomColor())
    }
  }, [onChange])

  const normalizedValue = normalizeColorValue(value, DEFAULT_VALUES.highlightColor)

  return (
    <Flex align="center" gap={8}>
      <ColorPicker
        value={normalizedValue}
        onChange={handleChange}
        showText={showText}
        format={format}
        presets={presets}
      />
      {showSurprise && <SurpriseButton onClick={handleSurprise}>Surprise me</SurpriseButton>}
    </Flex>
  )
}
