# Vue Best Practices

All Vue code in this project must follow these best practices.

## Component Structure

### Single File Components
- Use `<script setup lang="ts">` (Composition API with script setup syntax).
- Order sections: `<script>`, `<template>`, `<style>`.
- One component per file.

### Naming
- Use `PascalCase` for component file names (e.g., `NoteEditor.vue`).
- Use `PascalCase` for component references in templates.
- Use `camelCase` for props, events, and composable functions.
- Prefix composables with `use` (e.g., `useNotes`, `useValidation`).

## Composition API

### Reactivity
- Use `ref` for primitives and `reactive` for objects only when needed.
- Prefer `ref` over `reactive` for consistency.
- Use `computed` for derived state instead of watchers where possible.
- Avoid mutating props directly; emit events to the parent.

### Composables
- Extract reusable logic into composable functions under `src/composables/`.
- Return refs and functions from composables for flexibility.
- Keep composables focused on a single concern.

## State Management (Pinia)

- Define stores using the setup syntax (`defineStore` with a function).
- Keep stores focused on a specific domain (e.g., notes, auth).
- Use getters for computed/derived state.
- Use actions for async operations and state mutations.
- Avoid accessing stores directly in templates; use computed properties.

## Templates

- Keep templates declarative and logic-light.
- Use `v-if` / `v-else` instead of complex ternaries.
- Use `v-for` with a unique `:key` (avoid index as key when list items can change).
- Prefer shorthand for directives: `:` for `v-bind`, `@` for `v-on`, `#` for `v-slot`.
- Limit inline expressions; extract complex logic into computed properties or methods.

## Props and Events

- Define props with full type annotations using `defineProps<{}>()`.
- Provide default values using `withDefaults` when appropriate.
- Define emits with `defineEmits<{}>()` for type safety.
- Use descriptive event names (e.g., `update:modelValue`, `note-deleted`).

## TypeScript

- Enable strict mode in `tsconfig.json`.
- Define interfaces/types for props, emits, API responses, and store state.
- Place shared types in `src/types/`.
- Avoid `any`; prefer `unknown` when the type is truly uncertain.

## Performance

- Use `v-once` for static content that never changes.
- Use `v-memo` for expensive list rendering when appropriate.
- Lazy-load routes and heavy components with `defineAsyncComponent`.
- Avoid unnecessary watchers; prefer computed properties.

## Testing

- Write unit tests for composables and utility functions.
- Write component tests using `@vue/test-utils` with `mount` or `shallowMount`.
- Mock API calls and external dependencies.
- Test user interactions and emitted events, not internal implementation.

## Project Organization

- `src/components/` — reusable UI components.
- `src/store/` — Pinia stores.
- `src/api/` — API client and request functions.
- `src/types/` — shared TypeScript interfaces and types.
- `src/utils/` — pure utility/helper functions.
- Co-locate test files next to the source file (e.g., `Component.test.ts`).
