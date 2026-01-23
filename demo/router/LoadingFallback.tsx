import React from 'react'
import { Spin } from 'antd'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  animation: ${fadeIn} 0.2s ease-in;
`

/** 优化的加载组件 - 添加淡入动画改善体验 */
export const LoadingFallback: React.FC = () => {
  return (
    <Container>
      <Spin size="large" tip="加载中..." />
    </Container>
  )
}
