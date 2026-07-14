export interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ApiError {
  error?: string
  errors?: Record<string, string>
}
