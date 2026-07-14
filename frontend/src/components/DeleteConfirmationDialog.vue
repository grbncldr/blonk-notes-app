<script setup lang="ts">
import type { Note } from '@/types'

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      class="dialog"
    >
      <h2 id="delete-dialog-title" class="dialog-title">Delete Note</h2>
      <p class="dialog-message">
        Are you sure you want to delete '{{ props.note.title }}'?
      </p>
      <div class="dialog-actions">
        <button class="btn btn-cancel" @click="emit('cancel')">Cancel</button>
        <button class="btn btn-delete" @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  margin: 0 0 12px;
  font-size: 1.25rem;
}

.dialog-message {
  margin: 0 0 24px;
  color: #333;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-delete {
  background: #e53935;
  color: #fff;
}

.btn-delete:hover {
  background: #c62828;
}
</style>
