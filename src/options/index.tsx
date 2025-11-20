import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { OptionsApp } from './OptionsApp'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <OptionsApp />
    </ConfigProvider>
  </React.StrictMode>
)
