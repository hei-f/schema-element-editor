import { useEffect } from 'react'

interface UseStorageSyncProps {
  loadSettings: () => Promise<void>
}

/**
 * 配置存储同步 Hook
 * 监听 chrome.storage 变化，当配置被修改时自动重新加载
 *
 * 注意：仅在 Chrome 扩展环境中生效，demo 环境自动跳过
 */
export const useStorageSync = ({ loadSettings }: UseStorageSyncProps) => {
  useEffect(() => {
    // 检查是否在 Chrome 扩展环境中
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) {
      return
    }

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        // 检查是否有配置变化（排除草稿、收藏、预设配置本身）
        const hasConfigChange = Object.keys(changes).some(
          (key) => !key.startsWith('draft:') && key !== 'favorites' && key !== 'configPresets'
        )

        if (hasConfigChange) {
          // 配置发生变化，重新加载表单
          loadSettings()
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [loadSettings])
}
