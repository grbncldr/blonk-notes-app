<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotesStore } from '@/store/notes'
import { truncate } from '@/utils/truncate'
import type { Note } from '@/types'

const store = useNotesStore()

const emit = defineEmits<{
  create: []
  edit: [note: Note]
  delete: [note: Note]
}>()

onMounted(() => {
  store.fetchNotes()
})

function retry() {
  store.fetchNotes()
}
</script>

<template>
  <div class="notes-list-view">
    <div class="notes-header">
      <h2>My Notes</h2>
      <button class="create-button" @click="emit('create')">Create Note</button>
    </div>

    <!-- Loading state -->
    <div v-if="store.loading" class="notes-loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span>Loading notes...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="notes-error" role="alert">
      <p>{{ store.error }}</p>
      <button class="retry-button" @click="retry">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.notes.length === 0" class="notes-empty" role="status">
      <p>No notes yet. Create your first note!</p>
    </div>

    <!-- Notes list -->
    <ul v-else class="notes-list" aria-label="Notes">
      <li
        v-for="note in store.notes"
        :key="note.id"
        class="note-item"
      >
        <div class="note-content" @click="emit('edit', note)" role="button" tabindex="0" @keydown.enter="emit('edit', note)">
          <h3 class="note-title">{{ truncate(note.title, 50) }}</h3>
          <p class="note-body">{{ truncate(note.body, 120) }}</p>
        </div>
        <button
          class="delete-button"
          @click.stop="emit('delete', note)"
          :aria-label="`Delete ${note.title}`"
        >
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notes-list-view {
  padding: 1rem;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notes-header h2 {
  margin: 0;
}

.create-button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.create-button:hover {
  background: #1d4ed8;
}

.notes-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ccc;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notes-error {
  padding: 1rem;
  color: #b00;
}

.retry-button {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.notes-empty {
  padding: 1rem;
  color: #666;
}

.notes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.note-content {
  flex: 1;
  cursor: pointer;
}

.note-content:hover {
  background: #f9fafb;
}

.note-title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.note-body {
  margin: 0;
  color: #555;
  font-size: 0.875rem;
}

.delete-button {
  padding: 0.4rem 0.8rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.delete-button:hover {
  background: #fecaca;
}
</style>
