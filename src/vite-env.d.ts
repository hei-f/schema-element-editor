/// <reference types="vite/client" />

/**
 * 发布模式标识
 * - true: 发布版本，移除所有 console，隐藏调试开关
 * - false: 开发版本，保留 console，显示调试开关
 */
declare const __IS_RELEASE_BUILD__: boolean

/**
 * SVG 文件作为 React 组件导入的类型声明
 * 使用方式: import Icon from './icon.svg?react'
 */
declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react'
  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}
