import { diffLines, diffChars } from 'diff'

/** 行类型 */
export type LineType = 'unchanged' | 'added' | 'removed' | 'modified'

/** 单侧行信息 */
export interface SideLine {
  /** 行类型，placeholder 表示占位行 */
  type: LineType | 'placeholder'
  /** 行内容 */
  content: string
  /** 行号，placeholder 时为 null */
  lineNumber: number | null
  /** 对于 modified 行，存储对面行的内容用于行内 diff */
  pairContent?: string
}

/** diff 结果的一行（包含左右两侧信息） */
export interface DiffRow {
  /** 左侧行信息 */
  left: SideLine
  /** 右侧行信息 */
  right: SideLine
  /** 用于滚动同步的可视行索引 */
  visualIndex: number
}

/** 完整 diff 结果 */
export interface DiffResult {
  /** 所有行数据 */
  rows: DiffRow[]
  /** 左侧行号 -> visualIndex 映射 */
  leftLineMap: Map<number, number>
  /** 右侧行号 -> visualIndex 映射 */
  rightLineMap: Map<number, number>
}

/** 行内 diff 片段 */
export interface InlineDiffPart {
  /** 文本内容 */
  value: string
  /** 是否新增 */
  added?: boolean
  /** 是否删除 */
  removed?: boolean
}

/**
 * 计算行内字符级差异
 */
export function computeInlineDiff(leftContent: string, rightContent: string): InlineDiffPart[] {
  return diffChars(leftContent, rightContent)
}

/**
 * 计算两行之间的相似度 (0-1)
 */
function computeSimilarity(line1: string, line2: string): number {
  if (line1 === line2) return 1
  if (!line1 || !line2) return 0

  // 使用简单的字符匹配比例
  const longer = line1.length > line2.length ? line1 : line2
  const shorter = line1.length > line2.length ? line2 : line1

  if (longer.length === 0) return 1

  // 计算公共字符数
  let matches = 0
  const shorterChars = shorter.split('')
  const longerChars = longer.split('')

  for (const char of shorterChars) {
    const idx = longerChars.indexOf(char)
    if (idx !== -1) {
      matches++
      longerChars.splice(idx, 1)
    }
  }

  return matches / longer.length
}

/**
 * 智能配对 removed 和 added 行
 * 返回配对结果：每个 removed 行与最相似的 added 行配对
 */
function smartPairLines(
  removedLines: string[],
  addedLines: string[]
): Array<{ left: string | null; right: string | null; isModified: boolean }> {
  const result: Array<{ left: string | null; right: string | null; isModified: boolean }> = []

  const usedRemoved = new Set<number>()
  const usedAdded = new Set<number>()

  // 相似度阈值：超过此值才认为是修改而不是删除+新增
  const SIMILARITY_THRESHOLD = 0.3

  // 找出相似的行对
  const pairs: Array<{ ri: number; ai: number; similarity: number }> = []

  for (let ri = 0; ri < removedLines.length; ri++) {
    for (let ai = 0; ai < addedLines.length; ai++) {
      const similarity = computeSimilarity(removedLines[ri], addedLines[ai])
      if (similarity >= SIMILARITY_THRESHOLD) {
        pairs.push({ ri, ai, similarity })
      }
    }
  }

  // 按相似度降序排序
  pairs.sort((a, b) => b.similarity - a.similarity)

  // 贪心匹配
  const matchedPairs: Array<{ ri: number; ai: number }> = []
  for (const pair of pairs) {
    if (!usedRemoved.has(pair.ri) && !usedAdded.has(pair.ai)) {
      matchedPairs.push({ ri: pair.ri, ai: pair.ai })
      usedRemoved.add(pair.ri)
      usedAdded.add(pair.ai)
    }
  }

  // 按位置排序匹配对
  matchedPairs.sort((a, b) => a.ri - b.ri)

  // 构建结果：先处理未匹配的 added（在开头），然后处理匹配对和未匹配的 removed
  let ri = 0
  let ai = 0
  let matchIdx = 0

  while (ri < removedLines.length || ai < addedLines.length) {
    // 检查当前 removed 是否有匹配
    const currentMatch = matchedPairs[matchIdx]

    if (currentMatch && currentMatch.ri === ri) {
      // 处理匹配对之前的未匹配 added
      while (ai < currentMatch.ai) {
        if (!usedAdded.has(ai)) {
          result.push({ left: null, right: addedLines[ai], isModified: false })
        }
        ai++
      }

      // 处理匹配对
      result.push({
        left: removedLines[ri],
        right: addedLines[currentMatch.ai],
        isModified: true,
      })
      ri++
      ai = currentMatch.ai + 1
      matchIdx++
    } else if (ri < removedLines.length && !usedRemoved.has(ri)) {
      // 未匹配的 removed
      result.push({ left: removedLines[ri], right: null, isModified: false })
      ri++
    } else if (ai < addedLines.length && !usedAdded.has(ai)) {
      // 未匹配的 added
      result.push({ left: null, right: addedLines[ai], isModified: false })
      ai++
    } else {
      // 跳过已处理的行
      if (ri < removedLines.length) ri++
      if (ai < addedLines.length) ai++
    }
  }

  return result
}

/**
 * 计算两段文本的行级差异
 * 使用 LCS 算法（通过 diff 库的 diffLines）精确识别新增/删除/修改
 */
export function computeLineDiff(leftContent: string, rightContent: string): DiffResult {
  const changes = diffLines(leftContent, rightContent)

  const rows: DiffRow[] = []
  const leftLineMap = new Map<number, number>()
  const rightLineMap = new Map<number, number>()

  let leftLineNum = 1
  let rightLineNum = 1
  let visualIndex = 0

  // 预处理：将 changes 转换为更易处理的格式
  const processedChanges: Array<{
    type: 'unchanged' | 'removed' | 'added'
    lines: string[]
  }> = []

  for (const change of changes) {
    const lines = change.value.split('\n')
    // 移除最后一个空字符串（由于 split 产生）
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    if (lines.length === 0) continue

    if (change.added) {
      processedChanges.push({ type: 'added', lines })
    } else if (change.removed) {
      processedChanges.push({ type: 'removed', lines })
    } else {
      processedChanges.push({ type: 'unchanged', lines })
    }
  }

  // 处理 changes
  let i = 0
  while (i < processedChanges.length) {
    const current = processedChanges[i]

    if (current.type === 'unchanged') {
      // 未变化的行
      for (const line of current.lines) {
        leftLineMap.set(leftLineNum, visualIndex)
        rightLineMap.set(rightLineNum, visualIndex)

        rows.push({
          left: { type: 'unchanged', content: line, lineNumber: leftLineNum },
          right: { type: 'unchanged', content: line, lineNumber: rightLineNum },
          visualIndex,
        })

        leftLineNum++
        rightLineNum++
        visualIndex++
      }
      i++
    } else if (current.type === 'removed') {
      // 检查下一个是否是 added
      const next = processedChanges[i + 1]

      if (next && next.type === 'added') {
        // 使用智能配对
        const pairedLines = smartPairLines(current.lines, next.lines)

        for (const pair of pairedLines) {
          if (pair.isModified && pair.left !== null && pair.right !== null) {
            // 修改的行
            leftLineMap.set(leftLineNum, visualIndex)
            rightLineMap.set(rightLineNum, visualIndex)

            rows.push({
              left: {
                type: 'modified',
                content: pair.left,
                lineNumber: leftLineNum,
                pairContent: pair.right,
              },
              right: {
                type: 'modified',
                content: pair.right,
                lineNumber: rightLineNum,
                pairContent: pair.left,
              },
              visualIndex,
            })

            leftLineNum++
            rightLineNum++
          } else if (pair.left !== null) {
            // 只有左边（删除）
            leftLineMap.set(leftLineNum, visualIndex)

            rows.push({
              left: { type: 'removed', content: pair.left, lineNumber: leftLineNum },
              right: { type: 'placeholder', content: '', lineNumber: null },
              visualIndex,
            })

            leftLineNum++
          } else if (pair.right !== null) {
            // 只有右边（新增）
            rightLineMap.set(rightLineNum, visualIndex)

            rows.push({
              left: { type: 'placeholder', content: '', lineNumber: null },
              right: { type: 'added', content: pair.right, lineNumber: rightLineNum },
              visualIndex,
            })

            rightLineNum++
          }

          visualIndex++
        }

        i += 2 // 跳过 added
      } else {
        // 纯 removed
        for (const line of current.lines) {
          leftLineMap.set(leftLineNum, visualIndex)

          rows.push({
            left: { type: 'removed', content: line, lineNumber: leftLineNum },
            right: { type: 'placeholder', content: '', lineNumber: null },
            visualIndex,
          })

          leftLineNum++
          visualIndex++
        }
        i++
      }
    } else if (current.type === 'added') {
      // 纯 added（前面没有 removed）
      for (const line of current.lines) {
        rightLineMap.set(rightLineNum, visualIndex)

        rows.push({
          left: { type: 'placeholder', content: '', lineNumber: null },
          right: { type: 'added', content: line, lineNumber: rightLineNum },
          visualIndex,
        })

        rightLineNum++
        visualIndex++
      }
      i++
    }
  }

  return { rows, leftLineMap, rightLineMap }
}

/**
 * 根据 visualIndex 计算滚动位置
 * @param visualIndex 可视行索引
 * @param lineHeight 行高（像素）
 */
export function getScrollTopByVisualIndex(visualIndex: number, lineHeight: number): number {
  return visualIndex * lineHeight
}

/**
 * 根据滚动位置计算 visualIndex
 * @param scrollTop 滚动位置（像素）
 * @param lineHeight 行高（像素）
 */
export function getVisualIndexByScrollTop(scrollTop: number, lineHeight: number): number {
  return Math.floor(scrollTop / lineHeight)
}
