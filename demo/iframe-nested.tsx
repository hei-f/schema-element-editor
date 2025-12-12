import { createRoot } from 'react-dom/client'
import styled from 'styled-components'

/** 主容器 */
const NestedIframeContainer = styled.div`
  font-family: system-ui, sans-serif;
  padding: 16px;
  background: #fffbe6;
`

/** 标题区域 */
const NestedHeaderSection = styled.div`
  background: linear-gradient(135deg, #fff7e6 0%, #ffd591 100%);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #ffc069;
`

/** 标题文本 */
const NestedHeaderTitle = styled.h4`
  color: #d46b08;
  margin: 0 0 4px 0;
  font-size: 14px;
`

/** 描述文本 */
const NestedHeaderDescription = styled.p`
  color: #fa8c16;
  font-size: 12px;
  margin: 0;
`

/** 提示信息框 */
const NestedInfoBox = styled.div`
  background: #fff7e6;
  border: 1px solid #ffc069;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  font-size: 11px;
`

/** iframe 外层容器 */
const NestedIframeWrapper = styled.div`
  border: 2px dashed #ffc069;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
`

/** iframe 标题 */
const NestedIframeTitle = styled.h5`
  color: #d46b08;
  font-size: 12px;
  margin: 0 0 8px 0;
`

/** iframe 元素 */
const NestedStyledIframe = styled.iframe`
  width: 100%;
  height: 350px;
  border: 1px solid #ffc069;
  border-radius: 4px;
  background: #fff;
`

/**
 * 中间层 iframe 应用
 * 仅作为嵌套结构，不处理 Schema 请求
 * Alt 键状态由 content script 自动转发
 */
function NestedIframeApp() {
  const isTopFrame = window === window.top

  return (
    <NestedIframeContainer>
      <NestedHeaderSection>
        <NestedHeaderTitle>🔗 中间层 iframe（第 2 层）</NestedHeaderTitle>
        <NestedHeaderDescription>
          嵌套测试。window.top: {isTopFrame ? '是顶层' : '不是顶层'}
        </NestedHeaderDescription>
      </NestedHeaderSection>

      <NestedInfoBox>✅ Alt 键状态由 content script 自动转发到子 iframe</NestedInfoBox>

      <NestedIframeWrapper>
        <NestedIframeTitle>📦 内层 iframe（第 3 层）- 使用 SDK</NestedIframeTitle>
        <NestedStyledIframe src="/iframe-app.html" title="内层 iframe" />
      </NestedIframeWrapper>
    </NestedIframeContainer>
  )
}

// 渲染应用
createRoot(document.getElementById('root')!).render(<NestedIframeApp />)
