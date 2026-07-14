<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Note } from '@/types'
import { validateNote } from '@/utils/validation'

const props = defineProps<{
  note?: Note
  apiError?: string
}>()

const emit = defineEmits<{
  save: [data: { title: string; body: string }]
  cancel: []
}>()

const title = ref('')
const body = ref('')
const errors = ref<Record<string, string>>({})

function populateFromNote(note?: Note) {
  if (note) {
    title.value = note.title
    body.value = note.body
  } else {
    title.value = ''
    body.value = ''
  }
  errors.value = {}
}

populateFromNote(props.note)

watch(
  () => props.note,
  (newNote) => {
    populateFromNote(newNote)
  }
)

function handleSubmit() {
  errors.value = {}

  const result = validateNote({ title: title.value, body: body.value })

  if (!result.valid) {
    errors.value = result.errors
    return
  }

  emit('save', { title: title.value.trim(), body: body.value })
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" aria-label="Note editor" novalidate>
    <div
      v-if="apiError"
      role="alert"
      class="api-error"
    >
      {{ apiError }}
    </div>

    <div class="field">
      <label for="note-title">Title</label>
      <input
        id="note-title"
        v-model="title"
        type="text"
        :aria-invalid="!!errors.title"
        :aria-describedby="errors.title ? 'title-error' : undefined"
      />
      <p
        v-if="errors.title"
        id="title-error"
        class="field-error"
        role="alert"
      >
        {{ errors.title }}
      </p>
    </div>

    <div class="field">
      <label for="note-body">Body</label>
      <textarea
        id="note-body"
        v-model="body"
        :aria-invalid="!!errors.body"
        :aria-describedby="errors.body ? 'body-error' : undefined"
      ></textarea>
      <p
        v-if="errors.body"
        id="body-error"
        class="field-error"
        role="alert"
      >
        {{ errors.body }}
      </p>
    </div>

    <div class="actions">
      <button type="submit">Save</button>
      <button type="button" @click="handleCancel">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.api-error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.field textarea {
  min-height: 150px;
  resize: vertical;
}

.field-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.actions button[type="submit"] {
  background: #2563eb;
  color: white;
  border: none;
}

.actions button[type="button"] {
  background: white;
  border: 1px solid #d1d5db;
}
</style>
