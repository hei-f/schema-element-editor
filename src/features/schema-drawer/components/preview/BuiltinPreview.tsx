import { ContentType } from '@/shared/types'
import { MarkdownEditor, parserMarkdownToSlateNode } from '@ant-design/agentic-ui'
import type { Elements, MarkdownEditorInstance } from '@ant-design/agentic-ui'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

/**
 * 内置预览组件 Props
 */
interface BuiltinPreviewProps {
  /** 编辑器内容（JSON 字符串） */
  editorValue: string
  /** 内容类型 */
  contentType: ContentType
}

/**
 * 预览容器样式
 * 保持与宿主预览器相同的视觉效果：12px padding + 白色内容区
 */
const PreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
`

/**
 * 内容区域样式
 */
const ContentArea = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #fff;
  border-radius: 12px;

  /* MarkdownEditor 样式覆盖 */
  .md-editor-container {
    height: 100%;
    border: none;
    border-radius: 8px;
  }

  .md-editor-content {
    padding: 16px;
  }
`

/**
 * 将编辑器内容转换为 Slate 节点列表
 * - AST 类型：直接使用 Elements[]（contentType 已保证是有效的 Elements[]）
 * - RawString 类型：将 Markdown 字符串转换为 Slate 节点
 */
function convertToNodeList(editorValue: string, contentType: ContentType): Elements[] {
  if (!editorValue) {
    return []
  }

  try {
    const parsed = JSON.parse(editorValue)

    // AST 类型：直接使用节点（contentType 的判断已在 SchemaDrawer 中完成）
    if (contentType === ContentType.Ast) {
      return parsed as Elements[]
    }

    // RawString 类型：将 Markdown 字符串转换为节点
    if (contentType === ContentType.RawString) {
      const { schema } = parserMarkdownToSlateNode(parsed as string)
      return schema
    }

    return []
  } catch {
    return []
  }
}

/**
 * 内置预览组件
 * 使用 MarkdownEditor 渲染 Markdown 内容
 * 支持 AST 和 RawString 类型
 *
 * 注意：此组件只在 useBuiltinPreview=true 时渲染，
 * 而 useBuiltinPreview 已保证内容类型支持预览，
 * 所以此处不需要处理"不支持"的情况
 */
export const BuiltinPreview: React.FC<BuiltinPreviewProps> = (props) => {
  const { editorValue, contentType } = props
  const editorRef = useRef<MarkdownEditorInstance>(null)
  // 标记是否为首次渲染，跳过首次 effect
  const isFirstRender = useRef(true)
  // 使用 useState 的惰性初始化来计算初始值（Markdown 字符串，供 MarkdownEditor 初始化）
  const [initialValue] = useState(() => {
    if (!editorValue) return ''
    try {
      const parsed = JSON.parse(editorValue)
      // RawString 类型直接返回字符串
      if (contentType === ContentType.RawString && typeof parsed === 'string') {
        return parsed
      }
    } catch {
      // ignore
    }
    // AST 类型或其他情况返回空字符串，让 MarkdownEditor 使用空初始值
    // 然后通过 effect 使用 updateNodeList 设置内容
    return ''
  })

  // 当 editorValue 变化时，通过 store.updateNodeList 进行差异更新（避免闪烁）
  useEffect(() => {
    // 跳过首次渲染（MarkdownEditor 会使用 initValue）
    if (isFirstRender.current) {
      isFirstRender.current = false
      // AST 类型首次也需要设置内容（因为 initValue 是空的）
      if (contentType === ContentType.Ast && editorRef.current?.store) {
        const nodeList = convertToNodeList(editorValue, contentType)
        editorRef.current.store.updateNodeList(nodeList)
      }
      return
    }

    // 通过 ref 访问 store 并更新内容
    if (editorRef.current?.store) {
      const nodeList = convertToNodeList(editorValue, contentType)
      // 使用差异更新，只更新变化的部分，避免整个编辑器重新渲染
      editorRef.current.store.updateNodeList(nodeList)
    }
  }, [editorValue, contentType])

  return (
    <PreviewContainer>
      <ContentArea>
        <MarkdownEditor editorRef={editorRef} initValue={initialValue} readonly height="100%" />
      </ContentArea>
    </PreviewContainer>
  )
}
