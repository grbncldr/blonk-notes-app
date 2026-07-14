import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiClient, ApiClientError, ApiTimeoutError } from './client'
import type { Note } from '@/types'

const mockNote: Note = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Note',
  body: 'Test body content',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T11:45:00Z',
}

describe('ApiClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('getNotes', () => {
    it('returns notes array on success', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNote]),
      } as Response)

      const notes = await ApiClient.getNotes()
      expect(notes).toEqual([mockNote])
      expect(mockFetch).toHaveBeenCalledWith('/api/notes', expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
    })

    it('throws ApiClientError on non-OK response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Internal server error' }),
      } as unknown as Response)

      await expect(ApiClient.getNotes()).rejects.toThrow(ApiClientError)
      await expect(ApiClient.getNotes()).rejects.toMatchObject({
        status: 500,
        apiError: { error: 'Internal server error' },
      })
    })

    it('throws ApiTimeoutError when request times out', async () => {
      vi.mocked(global.fetch).mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            const signal = (options as RequestInit).signal
            if (signal) {
              signal.addEventListener('abort', () => {
                const err = new Error('The operation was aborted')
                err.name = 'AbortError'
                reject(err)
              })
            }
          })
      )

      const promise = ApiClient.getNotes()
      vi.advanceTimersByTime(5000)
      await expect(promise).rejects.toThrow(ApiTimeoutError)
    })
  })

  describe('createNote', () => {
    it('sends POST request with note data and returns created note', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNote),
      } as Response)

      const result = await ApiClient.createNote({ title: 'Test Note', body: 'Test body content' })
      expect(result).toEqual(mockNote)
      expect(mockFetch).toHaveBeenCalledWith('/api/notes', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Note', body: 'Test body content' }),
      }))
    })

    it('throws ApiClientError with field errors on 400 response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ errors: { title: 'Title is required' } }),
      } as unknown as Response)

      await expect(
        ApiClient.createNote({ title: '', body: '' })
      ).rejects.toMatchObject({
        status: 400,
        apiError: { errors: { title: 'Title is required' } },
      })
    })
  })

  describe('updateNote', () => {
    it('sends PUT request with note data and returns updated note', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...mockNote, title: 'Updated Title' }),
      } as Response)

      const result = await ApiClient.updateNote(mockNote.id, {
        title: 'Updated Title',
        body: 'Test body content',
      })
      expect(result.title).toBe('Updated Title')
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/notes/${mockNote.id}`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title', body: 'Test body content' }),
        })
      )
    })

    it('throws ApiClientError on 404 response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Note not found' }),
      } as unknown as Response)

      await expect(
        ApiClient.updateNote('nonexistent-id', { title: 'X', body: 'Y' })
      ).rejects.toMatchObject({
        status: 404,
        apiError: { error: 'Note not found' },
      })
    })
  })

  describe('deleteNote', () => {
    it('sends DELETE request and resolves on success', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      await expect(ApiClient.deleteNote(mockNote.id)).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/notes/${mockNote.id}`,
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('throws ApiClientError on 404 response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Note not found' }),
      } as unknown as Response)

      await expect(ApiClient.deleteNote('nonexistent-id')).rejects.toMatchObject({
        status: 404,
        apiError: { error: 'Note not found' },
      })
    })
  })

  describe('error parsing', () => {
    it('handles non-JSON error responses gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as unknown as Response)

      await expect(ApiClient.getNotes()).rejects.toMatchObject({
        status: 502,
        apiError: { error: 'HTTP 502: Bad Gateway' },
      })
    })
  })
})
