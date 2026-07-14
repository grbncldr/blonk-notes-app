import type { Note, ApiError } from '@/types'

const API_BASE = '/api/notes'
const TIMEOUT_MS = 5000

export class ApiClientError extends Error {
  public status: number
  public apiError: ApiError

  constructor(status: number, apiError: ApiError) {
    const message = apiError.error || 'Request failed'
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.apiError = apiError
  }
}

export class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out')
    this.name = 'ApiTimeoutError'
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiTimeoutError()
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const body = await response.json()
    return body as ApiError
  } catch {
    return { error: `HTTP ${response.status}: ${response.statusText}` }
  }
}

export const ApiClient = {
  async getNotes(): Promise<Note[]> {
    const response = await fetchWithTimeout(API_BASE)

    if (!response.ok) {
      const apiError = await parseErrorResponse(response)
      throw new ApiClientError(response.status, apiError)
    }

    return response.json()
  },

  async createNote(data: { title: string; body: string }): Promise<Note> {
    const response = await fetchWithTimeout(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const apiError = await parseErrorResponse(response)
      throw new ApiClientError(response.status, apiError)
    }

    return response.json()
  },

  async updateNote(
    id: string,
    data: { title: string; body: string }
  ): Promise<Note> {
    const response = await fetchWithTimeout(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const apiError = await parseErrorResponse(response)
      throw new ApiClientError(response.status, apiError)
    }

    return response.json()
  },

  async deleteNote(id: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const apiError = await parseErrorResponse(response)
      throw new ApiClientError(response.status, apiError)
    }
  },
}
