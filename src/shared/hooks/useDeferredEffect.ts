import { useEffect, useLayoutEffect, useRef, type DependencyList } from 'react'

/**
 * 延迟执行的 useEffect
 * 将回调推迟到指定延迟后执行，避免在 effect 中同步调用 setState 导致的级联渲染
 * @param effect 要执行的回调
 * @param deps 依赖数组
 * @param options 配置项
 * @param options.delay 延迟时间（毫秒），默认为 0
 * @param options.enabled 是否启用，默认为 true。为 false 时不创建定时器
 */
export function useDeferredEffect(
  effect: () => void,
  deps: DependencyList,
  options: { delay?: number; enabled?: boolean } = {}
): void {
  const { delay = 0, enabled = true } = options
  /** 存储 effect 函数的 ref，避免将其作为依赖项 */
  const effectRef = useRef(effect)

  // 在 layout effect 中更新 ref，确保在主 effect 执行前完成
  useLayoutEffect(() => {
    effectRef.current = effect
  })

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => effectRef.current(), delay)
    return () => clearTimeout(timer)
  }, [...deps, enabled, delay]) // deps 是动态数组，展开是必要的
}
