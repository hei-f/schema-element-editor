import React from 'react'
import {
  ExperimentOutlined,
  ApiOutlined,
  RobotOutlined,
  BlockOutlined,
  SettingOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'

export interface MenuItem {
  key: string
  icon: React.ReactElement
  label: string
}

export const menuItems: MenuItem[] = [
  {
    key: '/schema-tests',
    icon: <ApiOutlined />,
    label: 'Schema 功能测试',
  },
  {
    key: '/ast-test',
    icon: <ExperimentOutlined />,
    label: 'AST 转换测试',
  },
  {
    key: '/agentic-demo',
    icon: <RobotOutlined />,
    label: 'Agentic UI Demo',
  },
  {
    key: '/recording-test',
    icon: <VideoCameraOutlined />,
    label: '录制模式测试',
  },
  {
    key: '/multi-sdk-test',
    icon: <AppstoreOutlined />,
    label: '多 SDK 实例测试',
  },
  {
    key: '/iframe-test',
    icon: <BlockOutlined />,
    label: 'iframe 测试',
  },
  {
    key: '/builtin-preview-test',
    icon: <EyeOutlined />,
    label: '内置预览器测试',
  },
  {
    key: '/options-test',
    icon: <SettingOutlined />,
    label: '设置页开发',
  },
]
