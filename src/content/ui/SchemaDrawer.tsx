import type { ElementAttributes } from '@/types'
import { storage } from '@/utils/browser/storage'
import { deserializeJson, serializeJson } from '@/utils/schema/serializer'
import {
  convertToASTString,
  convertToMarkdownString,
  formatJsonString,
  isElementsArray,
  isStringData,
  parseMarkdownString,
  parserSchemaNodeToMarkdown
} from '@/utils/schema/transformers'
import Editor from '@monaco-editor/react'
import { Button, Drawer, Tooltip, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { MonacoErrorBoundary } from './MonacoErrorBoundary'
import {
  AttributeTag,
  ButtonGroup,
  DrawerContentContainer,
  DrawerFooter,
  EditorContainer,
  EditorToolbar,
  ParamItem,
  ParamLabel,
  ParamsContainer
} from './styles'

interface SchemaDrawerProps {
  open: boolean
  schemaData: any
  attributes: ElementAttributes
  onClose: () => void
  onSave: (data: any) => Promise<void>
  width: number | string
}

/**
 * Schema编辑器抽屉组件
 */
export const SchemaDrawer: React.FC<SchemaDrawerProps> = ({ 
  open, 
  schemaData, 
  attributes, 
  onClose, 
  onSave, 
  width 
}: SchemaDrawerProps) => {
  const [editorValue, setEditorValue] = useState<string>('')
  const [isModified, setIsModified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)
  const [toolbarButtons, setToolbarButtons] = useState({
    convertToAST: true,
    convertToMarkdown: true,
    deserialize: true,
    serialize: true,
    format: true
  })

  /**
   * 加载工具栏按钮配置
   */
  useEffect(() => {
    const loadToolbarConfig = async () => {
      try {
        const config = await storage.getToolbarButtons()
        setToolbarButtons(config)
      } catch (error) {
        console.error('加载工具栏配置失败:', error)
      }
    }
    loadToolbarConfig()
  }, [])

  /**
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    const processSchemaData = async () => {
    if (schemaData !== null && schemaData !== undefined) {
      try {
          const autoParseEnabled = await storage.getAutoParseString()
          
          if (autoParseEnabled && isStringData(schemaData)) {
            setWasStringData(true)
            const elements = parseMarkdownString(schemaData)
            
            if (elements.length > 0) {
              const formatted = JSON.stringify(elements, null, 2)
              setEditorValue(formatted)
              setIsModified(false)
            } else {
              message.warning('Markdown解析失败，显示原始字符串')
              setWasStringData(false)
              setEditorValue(JSON.stringify(schemaData, null, 2))
              setIsModified(false)
            }
          } else {
            setWasStringData(false)
        const formatted = JSON.stringify(schemaData, null, 2)
        setEditorValue(formatted)
        setIsModified(false)
          }
      } catch (error) {
          console.error('处理Schema数据失败:', error)
          setWasStringData(false)
        setEditorValue(JSON.stringify(schemaData))
          setIsModified(false)
        }
      }
    }
    
    processSchemaData()
  }, [schemaData])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      setIsModified(true)
    }
  }

  /**
   * 格式化JSON
   */
  const handleFormat = () => {
    const result = formatJsonString(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      message.success('格式化成功')
    } else {
      message.error(`格式化失败: ${result.error}`)
    }
  }

  /**
   * 序列化JSON
   */
  const handleSerialize = () => {
    try {
      const parsed = JSON.parse(editorValue)
      const result = serializeJson(parsed)
      
      if (result.success && result.data) {
        setEditorValue(result.data)
        setIsModified(true)
        message.success('序列化成功')
      } else {
        message.error(result.error || '序列化失败')
      }
    } catch (error: any) {
      message.error(`序列化失败: ${error.message}`)
    }
  }

  /**
   * 反序列化JSON
   */
  const handleDeserialize = () => {
    const result = deserializeJson(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      
      if (result.error) {
        message.warning(`${result.error}，已显示当前解析结果`)
      } else if (result.parseCount && result.parseCount > 0) {
        message.success(`反序列化成功（解析层数: ${result.parseCount}）`)
      } else {
        message.success('反序列化成功')
      }
    } else {
      message.error(result.error || '反序列化失败')
    }
  }

  /**
   * 转换为AST
   */
  const handleConvertToAST = () => {
    const result = convertToASTString(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      message.success('转换为AST成功')
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 转换为Markdown
   */
  const handleConvertToMarkdown = () => {
    const result = convertToMarkdownString(editorValue)
    
    if (result.success && result.data) {
      setEditorValue(result.data)
      setIsModified(true)
      message.success('转换为Markdown成功')
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 验证并保存
   */
  const handleSave = async () => {
    try {
      const parsed = JSON.parse(editorValue)

      setIsSaving(true)
      
      if (wasStringData) {
        // 原始数据是字符串，需要转换回字符串
        if (isElementsArray(parsed)) {
          // 如果是 Elements[] 数组，转换为 Markdown 字符串
          try {
            const markdownString = parserSchemaNodeToMarkdown(parsed)
            await onSave(markdownString)
            setIsModified(false)
            message.success('保存成功')
            onClose()
          } catch (error: any) {
            message.error(`转换为Markdown失败: ${error.message}`)
          }
        } else if (isStringData(parsed)) {
          // 已经是字符串，直接保存（避免多次序列化）
          await onSave(parsed)
          setIsModified(false)
          message.success('保存成功')
          onClose()
        } else {
          // 其他类型（对象、数组等），序列化为 JSON 字符串
          const jsonString = JSON.stringify(parsed)
          await onSave(jsonString)
          setIsModified(false)
          message.success('保存成功')
          onClose()
        }
      } else {
        // 原始数据不是字符串，保持原类型
        await onSave(parsed)
        setIsModified(false)
        message.success('保存成功')
        onClose()
      }
    } catch (error: any) {
      message.error(`保存失败: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 处理编辑器挂载
   */
  const handleEditorDidMount = () => {
    console.log('Monaco Editor 已挂载')
  }

  return (
    <Drawer
      title="Schema Editor"
      placement="right"
      width={width}
      onClose={onClose}
      open={open}
      destroyOnClose={false}
      closable={true}
      closeIcon={true}
      push={false}
      styles={{
        body: { padding: 0 },
        header: { position: 'relative' }
      }}
      footer={
        <DrawerFooter>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={handleSave} loading={isSaving} disabled={!isModified}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DrawerFooter>
      }
    >
      <DrawerContentContainer>
        <EditorToolbar>
          <ParamsContainer>
            {attributes.params && attributes.params.length > 0 && (
              <>
                {attributes.params.map((param: string, index: number) => (
                  <ParamItem key={index}>
                    <ParamLabel>params{index + 1}:</ParamLabel>
                    <Tooltip title={param} placement="topLeft">
                      <AttributeTag>{param}</AttributeTag>
                    </Tooltip>
                  </ParamItem>
                ))}
              </>
            )}
          </ParamsContainer>
          <ButtonGroup>
            {toolbarButtons.convertToAST && (
              <Button size="small" onClick={handleConvertToAST}>
                转换成AST
              </Button>
            )}
            {toolbarButtons.convertToMarkdown && (
              <Button size="small" onClick={handleConvertToMarkdown}>
                转换成Markdown
              </Button>
            )}
            {toolbarButtons.deserialize && (
              <Button size="small" onClick={handleDeserialize}>
                反序列化
              </Button>
            )}
            {toolbarButtons.serialize && (
              <Button size="small" onClick={handleSerialize}>
                序列化
              </Button>
            )}
            {toolbarButtons.format && (
              <Button size="small" onClick={handleFormat}>
                格式化
              </Button>
            )}
          </ButtonGroup>
        </EditorToolbar>

        <EditorContainer>
          <MonacoErrorBoundary>
            <Editor
              height="100%"
              defaultLanguage="json"
              value={editorValue}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs"
              options={{
                fontSize: 16,
                fontFamily: 'Monaco, Menlo, Consolas, monospace',
                lineNumbers: 'on',
                folding: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                autoIndent: 'full',
                bracketPairColorization: { enabled: true },
                matchBrackets: 'always',
                renderLineHighlight: 'all',
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true
                }
              }}
            />
          </MonacoErrorBoundary>
        </EditorContainer>
      </DrawerContentContainer>
    </Drawer>
  )
}

