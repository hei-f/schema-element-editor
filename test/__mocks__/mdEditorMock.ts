/**
 * @ant-design/md-editor mock
 */

export interface Elements {
  type: string
  children?: any[]
  [key: string]: any
}

export const parserMarkdownToSlateNode = (markdown: string): { schema: Elements[] } => {
  if (!markdown || markdown.trim() === '') {
    return { schema: [] }
  }

  const lines = markdown.split('\n')
  const schema: Elements[] = []

  for (const line of lines) {
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s*/, '')
      schema.push({
        type: 'head',
        level,
        children: [{ text }]
      })
    } else if (line.startsWith('-') || line.startsWith('*')) {
      const text = line.replace(/^[-*]\s*/, '')
      schema.push({
        type: 'list-item',
        children: [{ text }]
      })
    } else if (line.startsWith('```')) {
      schema.push({
        type: 'code',
        children: [{ text: line }]
      })
    } else if (line.trim()) {
      const children: any[] = []
      
      const boldRegex = /\*\*(.*?)\*\*/g
      // const italicRegex = /\*(.*?)\*/g  // 暂未使用
      
      // let lastIndex = 0  // 暂未使用
      let match
      
      const processText = (text: string) => {
        // let processed = text  // 暂未使用
        const parts: any[] = []
        let current = 0
        
        while ((match = boldRegex.exec(text)) !== null) {
          if (match.index > current) {
            parts.push({ text: text.slice(current, match.index) })
          }
          parts.push({ text: match[1], bold: true })
          current = match.index + match[0].length
        }
        
        if (current < text.length) {
          parts.push({ text: text.slice(current) })
        }
        
        return parts.length > 0 ? parts : [{ text }]
      }
      
      children.push(...processText(line))
      
      schema.push({
        type: 'paragraph',
        children
      })
    }
  }

  if (schema.length === 0) {
    schema.push({
      type: 'paragraph',
      children: [{ text: '' }]
    })
  }

  return { schema }
}

export const parserSlateNodeToMarkdown = (elements: Elements[]): string => {
  if (!elements || elements.length === 0) {
    return ''
  }

  const lines: string[] = []

  for (const element of elements) {
    switch (element.type) {
      case 'head':
        const hashes = '#'.repeat(element.level || 1)
        const headText = element.children?.map((c: any) => c.text).join('') || ''
        lines.push(`${hashes} ${headText}`)
        break
      
      case 'list-item':
        const listText = element.children?.map((c: any) => c.text).join('') || ''
        lines.push(`- ${listText}`)
        break
      
      case 'code':
        const codeText = element.children?.map((c: any) => c.text).join('') || ''
        lines.push(codeText)
        break
      
      case 'paragraph':
      default:
        const text = element.children?.map((c: any) => {
          if (c.bold) {
            return `**${c.text}**`
          }
          if (c.italic) {
            return `*${c.text}*`
          }
          return c.text
        }).join('') || ''
        if (text) {
          lines.push(text)
        }
        break
    }
  }

  return lines.join('\n')
}

