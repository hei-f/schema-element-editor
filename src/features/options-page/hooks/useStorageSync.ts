import { useEffect } from 'react'

interface UseStorageSyncProps {
  loadSettings: () => Promise<void>
}

/**
 * 配置存储同步 Hook
 * 监听 chrome.storage 变化，当配置被修改时自动重新加载
 */
export const useStorageSync = ({ loadSettings }: UseStorageSyncProps) => {
  useEffect(() => {
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
