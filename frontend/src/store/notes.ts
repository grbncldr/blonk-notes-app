import { defineStore } from 'pinia'
import { ApiClient } from '@/api/client'
import type { Note } from '@/types'

function sortByUpdatedAtDesc(notes: Note[]): Note[] {
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchNotes() {
      this.loading = true
      try {
        const notes = await ApiClient.getNotes()
        this.notes = sortByUpdatedAtDesc(notes)
        this.error = null
      } catch (err: unknown) {
        this.error =
          err instanceof Error ? err.message : 'Failed to fetch notes'
      } finally {
        this.loading = false
      }
    },

    async createNote(data: { title: string; body: string }) {
      try {
        const note = await ApiClient.createNote(data)
        this.notes.push(note)
        sortByUpdatedAtDesc(this.notes)
        this.error = null
      } catch (err: unknown) {
        this.error =
          err instanceof Error ? err.message : 'Failed to create note'
        throw err
      }
    },

    async updateNote(id: string, data: { title: string; body: string }) {
      try {
        const updated = await ApiClient.updateNote(id, data)
        const index = this.notes.findIndex((n) => n.id === id)
        if (index !== -1) {
          this.notes[index] = updated
        }
        sortByUpdatedAtDesc(this.notes)
        this.error = null
      } catch (err: unknown) {
        this.error =
          err instanceof Error ? err.message : 'Failed to update note'
        throw err
      }
    },

    async deleteNote(id: string) {
      try {
        await ApiClient.deleteNote(id)
        this.notes = this.notes.filter((n) => n.id !== id)
        this.error = null
      } catch (err: unknown) {
        this.error =
          err instanceof Error ? err.message : 'Failed to delete note'
        throw err
      }
    },
  },
})
