import { useEffect, useRef } from 'react'

/**
 * 返回一个 ref，其 .current 始终是最新的值
 * 用于解决闭包中访问过期值的问题
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
