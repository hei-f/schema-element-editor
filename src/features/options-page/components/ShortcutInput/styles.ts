import { Tag } from 'antd'
import styled from 'styled-components'

export const ShortcutInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const ShortcutDisplayBox = styled.div<{ $isRecording: boolean; $hasWarning: boolean }>`
  min-width: 140px;
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${(props) => (props.$isRecording ? '#13c2c2' : props.$hasWarning ? '#faad14' : '#d9d9d9')};
  border-radius: 8px;
  background: ${(props) => (props.$isRecording ? '#e6fffb' : '#fafafa')};
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #13c2c2;
    background: ${(props) => (props.$isRecording ? '#e6fffb' : '#f0f5ff')};
  }

  &:focus {
    outline: none;
    border-color: #13c2c2;
    box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.15);
  }
`

export const RecordingHintText = styled.span`
  color: #13c2c2;
  font-size: 13px;
  font-weight: 400;
`

export const PlaceholderText = styled.span`
  color: #bfbfbf;
  font-size: 13px;
  font-weight: 400;
`

export const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const WarningTag = styled(Tag)`
  margin: 0;
  font-size: 12px;
`
