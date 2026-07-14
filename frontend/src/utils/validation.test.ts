import { describe, it, expect } from 'vitest'
import { validateTitle, validateBody, validateNote } from './validation'

describe('validateTitle', () => {
  it('rejects empty string', () => {
    const result = validateTitle('')
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Title is required')
  })

  it('rejects whitespace-only string', () => {
    const result = validateTitle('   ')
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Title is required')
  })

  it('accepts a valid title', () => {
    const result = validateTitle('My Note')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('accepts title at exactly 200 characters', () => {
    const title = 'a'.repeat(200)
    const result = validateTitle(title)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects title exceeding 200 characters', () => {
    const title = 'a'.repeat(201)
    const result = validateTitle(title)
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Title must not exceed 200 characters')
  })

  it('trims before checking length', () => {
    const title = '  hello  '
    const result = validateTitle(title)
    expect(result.valid).toBe(true)
  })
})

describe('validateBody', () => {
  it('accepts empty body', () => {
    const result = validateBody('')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('accepts body at exactly 10000 characters', () => {
    const body = 'x'.repeat(10000)
    const result = validateBody(body)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects body exceeding 10000 characters', () => {
    const body = 'x'.repeat(10001)
    const result = validateBody(body)
    expect(result.valid).toBe(false)
    expect(result.errors.body).toBe('Body must not exceed 10000 characters')
  })
})

describe('validateNote', () => {
  it('accepts valid note', () => {
    const result = validateNote({ title: 'Hello', body: 'World' })
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('returns title error for empty title', () => {
    const result = validateNote({ title: '', body: 'ok' })
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Title is required')
    expect(result.errors.body).toBeUndefined()
  })

  it('returns body error for too-long body', () => {
    const result = validateNote({ title: 'ok', body: 'x'.repeat(10001) })
    expect(result.valid).toBe(false)
    expect(result.errors.body).toBe('Body must not exceed 10000 characters')
    expect(result.errors.title).toBeUndefined()
  })

  it('returns both errors when both fields are invalid', () => {
    const result = validateNote({ title: '   ', body: 'x'.repeat(10001) })
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Title is required')
    expect(result.errors.body).toBe('Body must not exceed 10000 characters')
  })
})
