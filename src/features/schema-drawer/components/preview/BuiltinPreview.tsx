import { ContentType } from '@/shared/types'
import {
  MarkdownEditor,
  parserMarkdownToSlateNode,
  parserSlateNodeToMarkdown,
} from '@ant-design/agentic-ui'
import type { Elements, MarkdownEditorInstance } from '@ant-design/agentic-ui'
import React, { useEffect, useRef } from 'react'
import { BuiltinPreviewContainer, BuiltinPreviewContentArea } from './styles'

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
 * 将编辑器内容转换为 Slate 节点列表
 * - AST 类型：Elements[] → Markdown String → 重新生成带新 hash 的 Elements[]
 * - RawString 类型：Markdown String → 生成带新 hash 的 Elements[]
 * 统一通过 parserMarkdownToSlateNode 转换，确保每次都生成新的 hash
 */
function convertToNodeList(editorValue: string, contentType: ContentType): Elements[] {
  if (!editorValue) {
    return []
  }

  try {
    const parsed = JSON.parse(editorValue)

    // 统一转换流程：先获取 Markdown 字符串，再转换为节点
    let markdownString: string

    if (contentType === ContentType.Ast) {
      // AST 类型：先转为 Markdown 字符串
      markdownString = parserSlateNodeToMarkdown(parsed as Elements[])
    } else if (contentType === ContentType.RawString) {
      // RawString 类型：直接使用
      markdownString = parsed as string
    } else {
      return []
    }

    // 统一通过 parserMarkdownToSlateNode 转换，生成新的 hash
    const { schema } = parserMarkdownToSlateNode(markdownString)
    return schema
  } catch (error) {
    console.error('[convertToNodeList] 转换失败', error)
    return []
  }
}

/**
 * 内置预览组件
 * 使用 MarkdownEditor 渲染 Markdown 内容
 * 支持 AST 和 RawString 类型
 */
export const BuiltinPreview: React.FC<BuiltinPreviewProps> = (props) => {
  const { editorValue, contentType } = props
  const editorRef = useRef<MarkdownEditorInstance>(null)

  // 实时更新预览内容
  useEffect(() => {
    if (!editorRef.current?.store) return

    const nodeList = convertToNodeList(editorValue, contentType)
    editorRef.current.store.updateNodeList(nodeList)
  }, [editorValue, contentType])

  // 使用空的 initValue，内容完全由 updateNodeList 控制
  return (
    <BuiltinPreviewContainer>
      <BuiltinPreviewContentArea>
        <MarkdownEditor editorRef={editorRef} initValue="" readonly height="100%" />
      </BuiltinPreviewContentArea>
    </BuiltinPreviewContainer>
  )
}
