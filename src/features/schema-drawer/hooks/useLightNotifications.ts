import { useCallback, useEffect, useRef, useState } from 'react'

interface LightNotification {
  id: string
  text: string
}

interface UseLightNotificationsReturn {
  lightNotifications: LightNotification[]
  showLightNotification: (text: string) => void
}

/**
 * 轻量提示管理 Hook
 */
export const useLightNotifications = (): UseLightNotificationsReturn => {
  const [lightNotifications, setLightNotifications] = useState<LightNotification[]>([])
  const lightNotificationTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * 显示轻量成功提示
   */
  const showLightNotification = useCallback((text: string) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    setLightNotifications((prev) => [...prev, { id, text }])

    const timer = setTimeout(() => {
      setLightNotifications((prev) => prev.filter((n) => n.id !== id))
      lightNotificationTimersRef.current.delete(id)
    }, 1500)

    lightNotificationTimersRef.current.set(id, timer)
  }, [])

  /**
   * 清理所有轻量通知定时器
   */
  useEffect(() => {
    return () => {
      lightNotificationTimersRef.current.forEach((timer) => clearTimeout(timer))
      lightNotificationTimersRef.current.clear()
    }
  }, [])

  return {
    lightNotifications,
    showLightNotification,
  }
}
