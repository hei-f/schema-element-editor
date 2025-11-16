import type { ElementAttributes, ElementPosition } from '@/types'
import { storage } from './storage'

/** 扩展UI元素的选择器 */
const UI_ELEMENT_SELECTOR = '[data-schema-editor-ui]'
/** 扩展UI元素的属性名 */
const UI_ELEMENT_ATTR = 'data-schema-editor-ui'

/**
 * 检查元素是否可见
 */
export function isVisibleElement(element: HTMLElement): boolean {
  // 排除特殊元素
  const tagName = element.tagName.toLowerCase()
  if (['script', 'style', 'link', 'meta', 'head'].includes(tagName)) {
    return false
  }

  // 检查是否隐藏
  const style = window.getComputedStyle(element)
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false
  }

  return true
}

/**
 * BFS向下搜索子元素
 */
function searchDescendants(
  element: HTMLElement,
  maxDepth: number,
  dataAttrName: string
): HTMLElement[] {
  const results: HTMLElement[] = []
  const queue: Array<{ el: HTMLElement; depth: number }> = [{ el: element, depth: 0 }]
  let queueIndex = 0

  while (queueIndex < queue.length) {
    const { el, depth } = queue[queueIndex++]

    // 超过最大深度则停止
    if (depth > maxDepth) continue

    // 直接遍历children，避免Array.from转换
    const children = el.children
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      
      // 跳过不可见元素
      if (!isVisibleElement(child)) continue

      // 跳过扩展UI元素
      if (child.hasAttribute(UI_ELEMENT_ATTR) || child.closest(UI_ELEMENT_SELECTOR)) {
        continue
      }

      // 如果有目标属性，加入结果
      if (child.hasAttribute(dataAttrName)) {
        results.push(child)
      }

      // 继续向下搜索
      queue.push({ el: child, depth: depth + 1 })
    }
  }

  return results
}

/**
 * 向上搜索父元素
 */
function searchAncestors(
  element: HTMLElement,
  maxDepth: number,
  dataAttrName: string
): HTMLElement[] {
  const results: HTMLElement[] = []
  let current: HTMLElement | null = element.parentElement
  let depth = 0

  while (current && depth < maxDepth) {
    // 跳过扩展UI元素
    if (current.hasAttribute(UI_ELEMENT_ATTR) || current.closest(UI_ELEMENT_SELECTOR)) {
      current = current.parentElement
      depth++
      continue
    }

    // 跳过不可见元素，合并条件判断
    if (isVisibleElement(current) && current.hasAttribute(dataAttrName)) {
      results.push(current)
    }

    current = current.parentElement
    depth++
  }

  return results
}

/**
 * 查找带有schema-params的元素
 * 使用elementsFromPoint获取鼠标位置下的所有元素，然后向下和向上搜索
 */
export async function findElementWithSchemaParams(
  mouseX: number,
  mouseY: number
): Promise<{ target: HTMLElement | null; candidates: HTMLElement[] }> {
  const attributeName = await storage.getAttributeName()
  const searchConfig = await storage.getSearchConfig()
  const dataAttrName = `data-${attributeName}`

  // 获取鼠标位置下的所有元素
  const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY) as HTMLElement[]

  const allCandidates: HTMLElement[] = []

  // 遍历每个元素
  for (let i = 0; i < elementsAtPoint.length; i++) {
    const element = elementsAtPoint[i] as HTMLElement
    
    // 忽略扩展自己的UI元素（提前终止，避免后续检查）
    if (element.closest(UI_ELEMENT_SELECTOR)) {
      continue
    }

    // 跳过不可见元素
    if (!isVisibleElement(element)) {
      continue
    }

    // 检查自身
    if (element.hasAttribute(dataAttrName)) {
      allCandidates.push(element)
    }

    // 向下搜索（深度为0时跳过）
    if (searchConfig.searchDepthDown > 0) {
      const descendants = searchDescendants(
        element,
        searchConfig.searchDepthDown,
        dataAttrName
      )
      allCandidates.push(...descendants)
    }

    // 向上搜索（深度为0时跳过）
    if (searchConfig.searchDepthUp > 0) {
      const ancestors = searchAncestors(
        element,
        searchConfig.searchDepthUp,
        dataAttrName
      )
      allCandidates.push(...ancestors)
    }
  }

  // 去重（UI元素已在搜索函数内部过滤）
  const uniqueCandidates = Array.from(new Set(allCandidates))

  // 返回第一个找到的元素作为目标
  const target = uniqueCandidates.length > 0 ? uniqueCandidates[0] : null

  return { target, candidates: uniqueCandidates }
}

/**
 * 从元素中获取目标属性
 * 从HTML data属性中读取并解析为参数数组
 */
export async function getElementAttributes(element: HTMLElement): Promise<ElementAttributes> {
  const attributeName = await storage.getAttributeName()
  const dataAttrName = `data-${attributeName}`
  const attrValue = element.getAttribute(dataAttrName)
  
  if (!attrValue) {
    return { params: [] }
  }
  
  const params = attrValue
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  
  return { params }
}

/**
 * 检查元素是否有有效的目标属性
 * 必须至少有一个参数
 */
export function hasValidAttributes(attrs: ElementAttributes): boolean {
  return attrs.params.length > 0
}

/**
 * 获取元素的位置和尺寸信息
 */
export function getElementPosition(element: HTMLElement): ElementPosition {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取鼠标位置相对于视口的坐标
 */
export function getMousePosition(event: MouseEvent): { x: number; y: number } {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

/**
 * 检查点击是否在元素内
 */
export function isClickInside(
  event: MouseEvent,
  element: HTMLElement
): boolean {
  const rect = element.getBoundingClientRect()
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  )
}

/**
 * 为元素添加高亮效果
 */
export function addHighlight(element: HTMLElement): void {
  element.style.outline = '2px solid #1890ff'
  element.style.outlineOffset = '2px'
  element.style.boxShadow = '0 0 10px rgba(24, 144, 255, 0.5)'
}

/**
 * 移除元素的高亮效果
 */
export function removeHighlight(element: HTMLElement): void {
  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.boxShadow = ''
}

/**
 * 为候选元素添加高亮效果
 */
export function addCandidateHighlight(element: HTMLElement): void {
  element.style.outline = '2px dashed rgba(24, 144, 255, 0.5)'
  element.style.outlineOffset = '2px'
  element.style.boxShadow = '0 0 5px rgba(24, 144, 255, 0.3)'
}

/**
 * 移除候选元素的高亮效果
 */
export function removeCandidateHighlight(element: HTMLElement): void {
  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.boxShadow = ''
}

