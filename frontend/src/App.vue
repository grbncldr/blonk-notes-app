<template>
  <div id="app">
    <header class="app-header">
      <h1>Notes</h1>
    </header>

    <NoteEditor
      v-if="editorVisible"
      :note="editingNote"
      :apiError="editorError"
      @save="handleSave"
      @cancel="closeEditor"
    />

    <NotesListView
      v-else
      @create="openCreate"
      @edit="openEdit"
      @delete="openDeleteDialog"
    />

    <DeleteConfirmationDialog
      v-if="noteToDelete"
      :note="noteToDelete"
      @confirm="handleDeleteConfirm"
      @cancel="closeDeleteDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Note } from '@/types'
import { useNotesStore } from '@/store/notes'
import { ApiClientError, ApiTimeoutError } from '@/api/client'
import NotesListView from '@/components/NotesListView.vue'
import NoteEditor from '@/components/NoteEditor.vue'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue'

const store = useNotesStore()

const editorVisible = ref(false)
const editingNote = ref<Note | undefined>(undefined)
const editorError = ref<string | undefined>(undefined)
const noteToDelete = ref<Note | undefined>(undefined)

function openCreate() {
  editingNote.value = undefined
  editorError.value = undefined
  editorVisible.value = true
}

function openEdit(note: Note) {
  editingNote.value = note
  editorError.value = undefined
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
  editingNote.value = undefined
  editorError.value = undefined
}

function openDeleteDialog(note: Note) {
  noteToDelete.value = note
}

function closeDeleteDialog() {
  noteToDelete.value = undefined
}

function formatFieldErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, msg]) => `${field}: ${msg}`)
    .join('; ')
}

async function handleSave(data: { title: string; body: string }) {
  editorError.value = undefined

  try {
    if (editingNote.value) {
      await store.updateNote(editingNote.value.id, data)
    } else {
      await store.createNote(data)
    }
    closeEditor()
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      if (err.status === 400 && err.apiError.errors) {
        editorError.value = formatFieldErrors(err.apiError.errors)
      } else if (err.status === 404) {
        editorError.value = undefined
        closeEditor()
        store.error = 'Note not found'
        await store.fetchNotes()
      } else {
        editorError.value = err.apiError.error || 'An unexpected error occurred'
      }
    } else if (err instanceof ApiTimeoutError) {
      editorError.value = 'Request timed out. Please try again.'
    } else {
      editorError.value = 'An unexpected error occurred'
    }
  }
}

async function handleDeleteConfirm() {
  if (!noteToDelete.value) return

  const noteId = noteToDelete.value.id

  try {
    await store.deleteNote(noteId)
    closeDeleteDialog()
  } catch (err: unknown) {
    closeDeleteDialog()

    if (err instanceof ApiClientError) {
      if (err.status === 404) {
        store.error = 'Note not found'
        await store.fetchNotes()
      } else {
        store.error = err.apiError.error || 'Failed to delete note'
      }
    } else if (err instanceof ApiTimeoutError) {
      store.error = 'Request timed out. Please try again.'
    } else {
      store.error = 'Failed to delete note'
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}
</style>
