import type { ValidationResult } from '@/types'

const MAX_TITLE_LENGTH = 200
const MAX_BODY_LENGTH = 10000

export function validateTitle(title: string): ValidationResult {
  const errors: Record<string, string> = {}
  const trimmed = title.trim()

  if (trimmed.length === 0) {
    errors.title = 'Title is required'
  } else if (trimmed.length > MAX_TITLE_LENGTH) {
    errors.title = 'Title must not exceed 200 characters'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateBody(body: string): ValidationResult {
  const errors: Record<string, string> = {}

  if (body.length > MAX_BODY_LENGTH) {
    errors.body = 'Body must not exceed 10000 characters'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateNote(data: { title: string; body: string }): ValidationResult {
  const titleResult = validateTitle(data.title)
  const bodyResult = validateBody(data.body)

  const errors: Record<string, string> = { ...titleResult.errors, ...bodyResult.errors }

  return { valid: Object.keys(errors).length === 0, errors }
}
