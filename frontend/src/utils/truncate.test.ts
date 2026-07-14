import { describe, it, expect } from 'vitest'
import { truncate } from './truncate'

describe('truncate', () => {
  it('returns the original string when length is within the limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the original string when length equals the limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when string exceeds the limit', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('returns ellipsis only when maxLength is 0 and text is non-empty', () => {
    expect(truncate('hello', 0)).toBe('...')
  })

  it('returns empty string unchanged when maxLength is 0', () => {
    expect(truncate('', 0)).toBe('')
  })

  it('handles empty string input', () => {
    expect(truncate('', 10)).toBe('')
  })
})
