import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from './notes'
import type { Note } from '@/types'

vi.mock('@/api/client', () => ({
  ApiClient: {
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  },
}))

import { ApiClient } from '@/api/client'

const mockedApi = ApiClient as {
  getNotes: ReturnType<typeof vi.fn>
  createNote: ReturnType<typeof vi.fn>
  updateNote: ReturnType<typeof vi.fn>
  deleteNote: ReturnType<typeof vi.fn>
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    title: 'Test Note',
    body: 'Test body',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useNotesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty notes, loading false, and error null', () => {
      const store = useNotesStore()
      expect(store.notes).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchNotes', () => {
    it('sets loading true during fetch and false after', async () => {
      const notes = [makeNote()]
      mockedApi.getNotes.mockResolvedValue(notes)

      const store = useNotesStore()
      const promise = store.fetchNotes()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })

    it('sorts notes by updatedAt descending', async () => {
      const notes = [
        makeNote({ id: '1', updatedAt: '2024-01-01T00:00:00Z' }),
        makeNote({ id: '2', updatedAt: '2024-01-03T00:00:00Z' }),
        makeNote({ id: '3', updatedAt: '2024-01-02T00:00:00Z' }),
      ]
      mockedApi.getNotes.mockResolvedValue(notes)

      const store = useNotesStore()
      await store.fetchNotes()

      expect(store.notes[0].id).toBe('2')
      expect(store.notes[1].id).toBe('3')
      expect(store.notes[2].id).toBe('1')
    })

    it('clears error on success', async () => {
      mockedApi.getNotes.mockResolvedValue([])

      const store = useNotesStore()
      store.error = 'previous error'
      await store.fetchNotes()

      expect(store.error).toBeNull()
    })

    it('sets error on failure', async () => {
      mockedApi.getNotes.mockRejectedValue(new Error('Network error'))

      const store = useNotesStore()
      await store.fetchNotes()

      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })
  })

  describe('createNote', () => {
    it('adds created note to the array and sorts', async () => {
      const existing = makeNote({ id: '1', updatedAt: '2024-01-01T00:00:00Z' })
      const created = makeNote({ id: '2', updatedAt: '2024-01-02T00:00:00Z' })
      mockedApi.createNote.mockResolvedValue(created)

      const store = useNotesStore()
      store.notes = [existing]
      await store.createNote({ title: 'New', body: 'Body' })

      expect(store.notes).toHaveLength(2)
      expect(store.notes[0].id).toBe('2')
    })

    it('clears error on success', async () => {
      mockedApi.createNote.mockResolvedValue(makeNote())

      const store = useNotesStore()
      store.error = 'old error'
      await store.createNote({ title: 'T', body: 'B' })

      expect(store.error).toBeNull()
    })

    it('sets error and re-throws on failure', async () => {
      mockedApi.createNote.mockRejectedValue(new Error('Create failed'))

      const store = useNotesStore()
      await expect(store.createNote({ title: 'T', body: 'B' })).rejects.toThrow(
        'Create failed'
      )
      expect(store.error).toBe('Create failed')
    })
  })

  describe('updateNote', () => {
    it('replaces the matching note and sorts', async () => {
      const original = makeNote({
        id: '1',
        title: 'Old',
        updatedAt: '2024-01-01T00:00:00Z',
      })
      const updated = makeNote({
        id: '1',
        title: 'Updated',
        updatedAt: '2024-01-03T00:00:00Z',
      })
      const other = makeNote({ id: '2', updatedAt: '2024-01-02T00:00:00Z' })

      mockedApi.updateNote.mockResolvedValue(updated)

      const store = useNotesStore()
      store.notes = [other, original]
      await store.updateNote('1', { title: 'Updated', body: 'Body' })

      expect(store.notes[0].id).toBe('1')
      expect(store.notes[0].title).toBe('Updated')
      expect(store.notes[1].id).toBe('2')
    })

    it('clears error on success', async () => {
      mockedApi.updateNote.mockResolvedValue(makeNote())

      const store = useNotesStore()
      store.notes = [makeNote()]
      store.error = 'old error'
      await store.updateNote('1', { title: 'T', body: 'B' })

      expect(store.error).toBeNull()
    })

    it('sets error and re-throws on failure', async () => {
      mockedApi.updateNote.mockRejectedValue(new Error('Update failed'))

      const store = useNotesStore()
      await expect(
        store.updateNote('1', { title: 'T', body: 'B' })
      ).rejects.toThrow('Update failed')
      expect(store.error).toBe('Update failed')
    })
  })

  describe('deleteNote', () => {
    it('removes the note from the array', async () => {
      mockedApi.deleteNote.mockResolvedValue(undefined)

      const store = useNotesStore()
      store.notes = [makeNote({ id: '1' }), makeNote({ id: '2' })]
      await store.deleteNote('1')

      expect(store.notes).toHaveLength(1)
      expect(store.notes[0].id).toBe('2')
    })

    it('clears error on success', async () => {
      mockedApi.deleteNote.mockResolvedValue(undefined)

      const store = useNotesStore()
      store.notes = [makeNote({ id: '1' })]
      store.error = 'old error'
      await store.deleteNote('1')

      expect(store.error).toBeNull()
    })

    it('sets error and re-throws on failure', async () => {
      mockedApi.deleteNote.mockRejectedValue(new Error('Delete failed'))

      const store = useNotesStore()
      await expect(store.deleteNote('1')).rejects.toThrow('Delete failed')
      expect(store.error).toBe('Delete failed')
    })
  })
})
